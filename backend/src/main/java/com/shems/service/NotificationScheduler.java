package com.shems.service;

import com.shems.entity.User;
import com.shems.repository.UsageSampleRepository;
import com.shems.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class NotificationScheduler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UsageSampleRepository usageSampleRepository;

    @Autowired
    private ReportService reportService;

    @Autowired
    private EmailService emailService;

    @Value("${shems.alerts.daily_kwh_threshold:10.0}")
    private double dailyKwhThreshold;

    @Value("${shems.alerts.peak_window_minutes:60}")
    private int peakWindowMinutes;

    @Value("${shems.alerts.peak_hour_kwh_threshold:2.0}")
    private double peakWindowKwhThreshold;

    @Value("${shems.alerts.peak_cooldown_minutes:180}")
    private int peakCooldownMinutes;

    @Scheduled(cron = "0 */10 * * * *") // every 10 minutes
    public void sendEnergyAndPeakAlerts() {
        if (!emailService.isConfigured()) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        List<User> users = userRepository.findAll();

        for (User u : users) {
            if (u == null) continue;
            if (!Boolean.TRUE.equals(u.getEmailVerified())) continue;
            if (!Boolean.TRUE.equals(u.getNotifyEmailNotifications())) continue;
            if (u.getEmail() == null || u.getEmail().isBlank()) continue;

            boolean updated = false;

            if (Boolean.TRUE.equals(u.getNotifyEnergyAlerts())) {
                updated |= maybeSendDailyEnergyAlert(u, now);
            }
            if (Boolean.TRUE.equals(u.getNotifyPeakAlerts())) {
                updated |= maybeSendPeakAlert(u, now);
            }
            if (Boolean.TRUE.equals(u.getNotifyEmailNotifications())) {
                updated |= maybeSendMonthlyTargetReached(u, now);
            }

            if (updated) {
                userRepository.save(u);
            }
        }
    }

    // Monday 08:00
    @Scheduled(cron = "0 0 8 * * MON")
    public void sendWeeklyReports() {
        if (!emailService.isConfigured()) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        LocalDate endDate = now.toLocalDate();
        LocalDate startDate = endDate.minusDays(6);

        for (User u : userRepository.findAll()) {
            if (u == null) continue;
            if (!Boolean.TRUE.equals(u.getEmailVerified())) continue;
            if (!Boolean.TRUE.equals(u.getNotifyEmailNotifications())) continue;
            if (!Boolean.TRUE.equals(u.getNotifyWeeklyReports())) continue;
            if (u.getEmail() == null || u.getEmail().isBlank()) continue;

            // avoid duplicate sends if the job is triggered more than once
            if (u.getLastWeeklyReportAt() != null && u.getLastWeeklyReportAt().isAfter(now.minusDays(3))) {
                continue;
            }

            try {
                byte[] excel = reportService.generateUsageReport(u.getId(), startDate, endDate, "Weekly Electricity Usage Report");
                emailService.sendWeeklyReport(u.getEmail(), safeName(u), startDate, endDate, excel);
                u.setLastWeeklyReportAt(now);
                userRepository.save(u);
            } catch (Exception e) {
                System.err.println("Failed to send weekly report to userId=" + u.getId() + ": " + e.getMessage());
            }
        }
    }

    private boolean maybeSendDailyEnergyAlert(User u, LocalDateTime now) {
        LocalDate today = now.toLocalDate();
        LocalDateTime dayStart = LocalDateTime.of(today, LocalTime.MIDNIGHT);

        if (u.getLastEnergyAlertAt() != null && !u.getLastEnergyAlertAt().isBefore(dayStart)) {
            return false;
        }

        LocalDateTime end = now;
        Double sum = usageSampleRepository.sumKwhForUserBetween(u.getId(), dayStart, end);
        double totalKwh = sum == null ? 0.0 : sum;

        double threshold = resolveDailyThreshold(u);
        if (totalKwh < threshold) {
            return false;
        }

        try {
            emailService.sendEnergyAlert(u.getEmail(), safeName(u), today, round2(totalKwh), round2(threshold));
            u.setLastEnergyAlertAt(now);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send daily energy alert to userId=" + u.getId() + ": " + e.getMessage());
            return false;
        }
    }

    private boolean maybeSendPeakAlert(User u, LocalDateTime now) {
        if (u.getLastPeakAlertAt() != null && u.getLastPeakAlertAt().isAfter(now.minusMinutes(peakCooldownMinutes))) {
            return false;
        }

        LocalDateTime start = now.minusMinutes(peakWindowMinutes);
        Double sum = usageSampleRepository.sumKwhForUserBetween(u.getId(), start, now);
        double windowKwh = sum == null ? 0.0 : sum;

        if (windowKwh < peakWindowKwhThreshold) {
            return false;
        }

        String windowLabel = start.format(DateTimeFormatter.ofPattern("h:mm a")) + " - " + now.format(DateTimeFormatter.ofPattern("h:mm a"));
        try {
            emailService.sendPeakHourAlert(u.getEmail(), safeName(u), windowLabel, round2(windowKwh), round2(peakWindowKwhThreshold));
            u.setLastPeakAlertAt(now);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send peak alert to userId=" + u.getId() + ": " + e.getMessage());
            return false;
        }
    }

    private double resolveDailyThreshold(User u) {
        Integer monthlyTarget = u.getMonthlyTargetKwh();
        if (monthlyTarget != null && monthlyTarget > 0) {
            // rough daily threshold based on monthly target
            return monthlyTarget / 30.0;
        }
        return dailyKwhThreshold;
    }

    private boolean maybeSendMonthlyTargetReached(User u, LocalDateTime now) {
        Integer target = u.getMonthlyTargetKwh();
        if (target == null || target <= 0) {
            return false;
        }

        LocalDate monthStart = now.toLocalDate().withDayOfMonth(1);
        LocalDateTime monthStartTs = LocalDateTime.of(monthStart, LocalTime.MIDNIGHT);

        if (u.getLastMonthlyTargetAlertAt() != null && u.getLastMonthlyTargetAlertAt().isAfter(monthStartTs)) {
            return false;
        }

        Double sum = usageSampleRepository.sumKwhForUserBetween(u.getId(), monthStartTs, now);
        double monthKwh = sum == null ? 0.0 : sum;
        if (monthKwh < target) {
            return false;
        }

        try {
            emailService.sendMonthlyTargetReached(u.getEmail(), safeName(u), target, round2(monthKwh), now.toLocalDate());
            u.setLastMonthlyTargetAlertAt(now);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send monthly target alert to userId=" + u.getId() + ": " + e.getMessage());
            return false;
        }
    }

    private static String safeName(User u) {
        String name = u.getFirstName();
        return (name == null || name.isBlank()) ? "User" : name.trim();
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
