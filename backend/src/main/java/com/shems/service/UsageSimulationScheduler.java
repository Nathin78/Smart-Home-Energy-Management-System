package com.shems.service;

import com.shems.entity.Device;
import com.shems.entity.UsageSample;
import com.shems.repository.DeviceRepository;
import com.shems.repository.UsageSampleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class UsageSimulationScheduler {

    private static final int TICK_SECONDS = 10;
    private static final int RETAIN_DAYS = 35;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private UsageSampleRepository usageSampleRepository;

    @Autowired
    private RealtimeService realtimeService;

    @Scheduled(fixedRate = TICK_SECONDS * 1000L)
    public void recordSamples() {
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        List<Device> devices = deviceRepository.findAll();
        Set<Long> touchedUsers = new HashSet<>();

        for (Device d : devices) {
            if (!isActive(d)) continue;

            double kw = toKw(d.getPowerUsage());
            if (kw <= 0) continue;

            double util = utilization(d.getType());
            // small jitter to avoid perfectly flat lines
            double jitter = 0.9 + ThreadLocalRandom.current().nextDouble() * 0.2;
            double dtHours = TICK_SECONDS / 3600.0;

            double kwh = kw * util * jitter * dtHours;
            UsageSample sample = new UsageSample(null, d.getUserId(), d.getId(), now, kwh);
            usageSampleRepository.save(sample);
            touchedUsers.add(d.getUserId());
        }

        for (Long userId : touchedUsers) {
            realtimeService.tick(userId);
        }
    }

    @Scheduled(cron = "0 0 3 * * *") // daily 03:00
    public void cleanupOldSamples() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(RETAIN_DAYS);
        usageSampleRepository.deleteByTimestampBefore(cutoff);
    }

    private static boolean isActive(Device d) {
        if (d == null) return false;
        if (Boolean.FALSE.equals(d.getOnline())) return false;
        String status = d.getStatus() == null ? "active" : d.getStatus().toLowerCase(Locale.ROOT);
        return !"inactive".equals(status);
    }

    private static double toKw(Double powerUsage) {
        if (powerUsage == null) return 0.0;
        // If the stored value looks like Watts, convert to kW.
        if (powerUsage > 50.0) return powerUsage / 1000.0;
        return powerUsage;
    }

    private static double utilization(String type) {
        String t = type == null ? "" : type.toLowerCase(Locale.ROOT);
        if (t.contains("hvac") || t.contains("ac") || t.contains("air")) return 0.35;
        if (t.contains("refriger")) return 0.60;
        if (t.contains("light")) return 0.12;
        if (t.contains("tv") || t.contains("entertain")) return 0.18;
        if (t.contains("heater")) return 0.28;
        return 0.22;
    }
}
