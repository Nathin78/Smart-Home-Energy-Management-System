package com.shems.controller;

import com.shems.service.ConsumptionService;
import com.shems.entity.Device;
import com.shems.entity.Room;
import com.shems.entity.UsageSample;
import com.shems.entity.User;
import com.shems.dto.DashboardPreferencesRequest;
import com.shems.repository.DeviceRepository;
import com.shems.repository.RoomRepository;
import com.shems.repository.UsageSampleRepository;
import com.shems.repository.UserRepository;
import com.shems.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private ConsumptionService consumptionService;

    @Autowired
    private UsageSampleRepository usageSampleRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReportService reportService;

    @GetMapping("/energy-stats")
    public ResponseEntity<?> getEnergyStats(@RequestParam(required = false) Long userId) {
        try {
            Map<String, Object> stats = new HashMap<>();

            if (userId == null) {
                stats.put("totalConsumption", 145.5);
                stats.put("averageDaily", 12.3);
                stats.put("peakHour", "7:00 PM");
                stats.put("savingsPotential", "15%");
                stats.put("activeDevices", 5);
                stats.put("status", "Normal");
                return ResponseEntity.ok(stats);
            }

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime todayStart = LocalDateTime.of(now.toLocalDate(), LocalTime.MIDNIGHT);
            LocalDateTime weekStart = LocalDateTime.of(now.toLocalDate().minusDays(6), LocalTime.MIDNIGHT);
            LocalDateTime monthStart = LocalDateTime.of(now.toLocalDate().minusDays(29), LocalTime.MIDNIGHT);

            double todayKwh = safeSum(usageSampleRepository.sumKwhForUserBetween(userId, todayStart, now));
            double weekKwh = safeSum(usageSampleRepository.sumKwhForUserBetween(userId, weekStart, now));
            double monthKwh = safeSum(usageSampleRepository.sumKwhForUserBetween(userId, monthStart, now));

            double monthlyAverage = monthKwh / 30.0;
            double tariffInrPerKwh = 8.0;
            double dailyCost = todayKwh * tariffInrPerKwh;
            double weeklyCost = weekKwh * tariffInrPerKwh;
            double monthlyCost = monthKwh * tariffInrPerKwh;

            List<Device> devices = deviceRepository.findByUserId(userId);
            long activeDevices = devices.stream().filter(d -> {
                if (Boolean.FALSE.equals(d.getOnline())) return false;
                String status = d.getStatus() == null ? "active" : d.getStatus().toLowerCase(Locale.ROOT);
                return !"inactive".equals(status);
            }).count();

            stats.put("todayConsumption", Math.round(todayKwh * 10.0) / 10.0);
            stats.put("weeklyConsumption", Math.round(weekKwh * 10.0) / 10.0);
            stats.put("monthlyConsumption", Math.round(monthKwh * 10.0) / 10.0);
            stats.put("monthlyAverage", Math.round(monthlyAverage * 10.0) / 10.0);
            stats.put("dailyCost", Math.round(dailyCost * 100.0) / 100.0);
            stats.put("weeklyCost", Math.round(weeklyCost * 100.0) / 100.0);
            stats.put("monthlyCost", Math.round(monthlyCost * 100.0) / 100.0);
            stats.put("activeDevices", activeDevices);
            stats.put("status", "Normal");
            stats.put("unit", "kWh");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return buildError(e.getMessage());
        }
    }

    @GetMapping("/consumption")
    public ResponseEntity<?> getConsumption(@RequestParam Long userId, @RequestParam(required = false) String period) {
        try {
            return ResponseEntity.ok(consumptionService.getConsumption(userId, period));
        } catch (Exception e) {
            return buildError(e.getMessage());
        }
    }

    @GetMapping("/today-consumption")
    public ResponseEntity<?> getTodayConsumption() {
        try {
            Map<String, Object> consumption = new HashMap<>();
            consumption.put("today", 12.3);
            consumption.put("yesterday", 10.8);
            consumption.put("Average", 11.5);
            consumption.put("unit", "kWh");
            return ResponseEntity.ok(consumption);
        } catch (Exception e) {
            return buildError(e.getMessage());
        }
    }

    @GetMapping("/monthly-data")
    public ResponseEntity<?> getMonthlyData() {
        try {
            Map<String, Object> monthly = new HashMap<>();
            monthly.put("month", "March 2026");
            monthly.put("totalUsage", 350.0);
            monthly.put("averageDaily", 11.7);
            monthly.put("peakDay", "March 3");
            monthly.put("unit", "kWh");
            return ResponseEntity.ok(monthly);
        } catch (Exception e) {
            return buildError(e.getMessage());
        }
    }

    @GetMapping("/report/weekly")
    public ResponseEntity<byte[]> downloadWeeklyReport(@RequestParam Long userId) {
        try {
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(6);

            byte[] excelData = reportService.generateUsageReport(userId, startDate, endDate, "Weekly Electricity Usage Report");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "weekly_usage_report.xlsx");
            headers.setContentLength(excelData.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelData);
        } catch (Exception e) {
            e.printStackTrace();
            return buildReportError(e);
        }
    }

    @GetMapping("/report/daily")
    public ResponseEntity<byte[]> downloadDailyReport(
            @RequestParam Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        try {
            LocalDate reportDate = (date != null) ? date : LocalDate.now();
            LocalDate startDate = reportDate;
            LocalDate endDate = reportDate;

            byte[] excelData = reportService.generateUsageReport(userId, startDate, endDate, "Daily Electricity Usage Report");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "daily_usage_report_" + reportDate + ".xlsx");
            headers.setContentLength(excelData.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelData);
        } catch (Exception e) {
            e.printStackTrace();
            return buildReportError(e);
        }
    }

    @GetMapping("/report/monthly")
    public ResponseEntity<byte[]> downloadMonthlyReport(@RequestParam Long userId) {
        try {
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusDays(29);

            byte[] excelData = reportService.generateUsageReport(userId, startDate, endDate, "Monthly Electricity Usage Report");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "monthly_usage_report.xlsx");
            headers.setContentLength(excelData.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelData);
        } catch (Exception e) {
            e.printStackTrace();
            return buildReportError(e);
        }
    }

    @GetMapping("/preferences")
    public ResponseEntity<?> getPreferences(@RequestParam Long userId) {
        try {
            User u = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
            Map<String, Object> resp = new HashMap<>();
            resp.put("energyAlerts", Boolean.TRUE.equals(u.getNotifyEnergyAlerts()));
            resp.put("emailNotifications", Boolean.TRUE.equals(u.getNotifyEmailNotifications()));
            resp.put("weeklyReports", Boolean.TRUE.equals(u.getNotifyWeeklyReports()));
            resp.put("peakAlerts", Boolean.TRUE.equals(u.getNotifyPeakAlerts()));
            resp.put("monthlyTargetKwh", u.getMonthlyTargetKwh());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return buildError(e.getMessage());
        }
    }

    @GetMapping("/room-wise")
    public ResponseEntity<?> getRoomWise(@RequestParam Long userId) {
        try {
            if (!userRepository.existsById(userId)) {
                return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            }

            ensureDefaultRooms(userId);
            List<Room> rooms = roomRepository.findByUserId(userId);
            List<Device> devices = deviceRepository.findByUserId(userId);

            Map<String, List<Long>> roomToDeviceIds = new HashMap<>();
            for (Device d : devices) {
                if (d == null || d.getLocation() == null || d.getLocation().trim().isEmpty()) {
                    continue;
                }
                String key = d.getLocation().trim().toLowerCase();
                roomToDeviceIds.computeIfAbsent(key, k -> new java.util.ArrayList<>()).add(d.getId());
            }

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime dayStart = LocalDateTime.of(now.toLocalDate(), LocalTime.MIDNIGHT);

            List<Map<String, Object>> result = new java.util.ArrayList<>();
            double totalKwh = 0.0;

            int idx = 0;
            for (Room room : rooms) {
                String name = room.getName();
                String key = name == null ? "" : name.trim().toLowerCase();
                List<Long> deviceIds = roomToDeviceIds.getOrDefault(key, java.util.Collections.emptyList());
                double kwh = 0.0;
                if (!deviceIds.isEmpty()) {
                    Double sum = usageSampleRepository.sumKwhForUserAndDevicesBetween(userId, deviceIds, dayStart, now);
                    kwh = sum == null ? 0.0 : sum;
                }
                totalKwh += kwh;

                Map<String, Object> row = new HashMap<>();
                row.put("name", name);
                row.put("consumption", round1(kwh));
                row.put("average", round2(kwh / 24.0));
                row.put("peak", "2PM - 6PM");
                row.put("trend", "Stable");
                row.put("color", pickRoomColor(idx));
                result.add(row);
                idx++;
            }

            for (Map<String, Object> row : result) {
                double kwh = ((Number) row.get("consumption")).doubleValue();
                double pct = totalKwh > 0 ? (kwh / totalKwh) * 100.0 : 0.0;
                row.put("percentage", Math.round(pct));
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return buildError(e.getMessage());
        }
    }

    @PostMapping("/preferences")
    public ResponseEntity<?> savePreferences(@RequestParam Long userId, @RequestBody DashboardPreferencesRequest request) {
        try {
            User u = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
            if (request.getEnergyAlerts() != null) u.setNotifyEnergyAlerts(request.getEnergyAlerts());
            if (request.getEmailNotifications() != null) u.setNotifyEmailNotifications(request.getEmailNotifications());
            if (request.getWeeklyReports() != null) u.setNotifyWeeklyReports(request.getWeeklyReports());
            if (request.getPeakAlerts() != null) u.setNotifyPeakAlerts(request.getPeakAlerts());
            if (request.getMonthlyTargetKwh() != null) u.setMonthlyTargetKwh(request.getMonthlyTargetKwh());
            userRepository.save(u);
            Map<String, String> resp = new HashMap<>();
            resp.put("message", "Preferences saved");
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return buildError(e.getMessage());
        }
    }

    private ResponseEntity<byte[]> buildReportError(Exception e) {
        String message = e.getMessage() == null ? "Failed to generate report" : e.getMessage();
        String json = "{\"message\":\"" + jsonEscape(message) + "\"}";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        byte[] body = json.getBytes(StandardCharsets.UTF_8);
        headers.setContentLength(body.length);

        return ResponseEntity.status(500)
                .headers(headers)
                .body(body);
    }

    private static String jsonEscape(String s) {
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "\\r")
                .replace("\n", "\\n");
    }

    private ResponseEntity<?> buildError(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("message", message);
        return ResponseEntity.status(500).body(error);
    }

    private double safeSum(Double value) {
        return value == null ? 0.0 : value;
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private static String pickRoomColor(int index) {
        String[] colors = new String[] {
                "#8B5FBF", "#4A90E2", "#2ECC71", "#F5A623", "#E74C3C", "#95A5A6",
                "#7F8C8D", "#1ABC9C", "#9B59B6", "#D35400"
        };
        return colors[Math.abs(index) % colors.length];
    }

    private void ensureDefaultRooms(Long userId) {
        String[] rooms = new String[] {
                "Living Room",
                "Kitchen",
                "Master Bedroom",
                "Bedroom",
                "Bathroom",
                "Home Office",
                "Dining Room",
                "Garage"
        };
        for (String name : rooms) {
            if (!roomRepository.existsByUserIdAndNameIgnoreCase(userId, name)) {
                Room room = new Room();
                room.setUserId(userId);
                room.setName(name);
                roomRepository.save(room);
            }
        }
    }
}
