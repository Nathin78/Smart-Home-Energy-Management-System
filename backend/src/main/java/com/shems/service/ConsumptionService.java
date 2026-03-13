package com.shems.service;

import com.shems.entity.Device;
import com.shems.entity.UsageSample;
import com.shems.repository.DeviceRepository;
import com.shems.repository.UsageSampleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class ConsumptionService {

    @Autowired
    private UsageSampleRepository usageSampleRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    public Map<String, Object> getConsumption(Long userId, String period) {
        String normalized = (period == null) ? "daily" : period.trim().toLowerCase();
        if (!List.of("daily", "weekly", "monthly").contains(normalized)) {
            normalized = "daily";
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();

        LocalDateTime start;
        int bucketCount;
        if ("daily".equals(normalized)) {
            start = LocalDateTime.of(today, LocalTime.MIDNIGHT);
            bucketCount = 24;
        } else if ("weekly".equals(normalized)) {
            start = LocalDateTime.of(today.minusDays(6), LocalTime.MIDNIGHT);
            bucketCount = 7;
        } else {
            start = LocalDateTime.of(today.minusDays(29), LocalTime.MIDNIGHT);
            bucketCount = 30;
        }

        LocalDateTime end = now.plusSeconds(1);
        List<UsageSample> samples = usageSampleRepository.findByUserIdAndTimestampBetweenOrderByTimestamp(userId, start, end);

        double[] buckets = new double[bucketCount];
        Map<Long, Double> deviceTotals = new HashMap<>();

        for (UsageSample s : samples) {
            int idx = bucketIndex(normalized, start.toLocalDate(), s.getTimestamp());
            if (idx >= 0 && idx < bucketCount) {
                buckets[idx] += safe(s.getConsumptionKwh());
            }
            deviceTotals.merge(s.getDeviceId(), safe(s.getConsumptionKwh()), Double::sum);
        }

        List<Map<String, Object>> points = new ArrayList<>();
        if ("daily".equals(normalized)) {
            for (int h = 0; h < 24; h++) {
                points.add(point(h + ":00", round1(buckets[h])));
            }
        } else if ("weekly".equals(normalized)) {
            for (int i = 0; i < 7; i++) {
                LocalDate d = start.toLocalDate().plusDays(i);
                String label = d.format(DateTimeFormatter.ofPattern("EEE", Locale.ENGLISH));
                points.add(point(label, round1(buckets[i])));
            }
        } else {
            for (int i = 0; i < 30; i++) {
                LocalDate d = start.toLocalDate().plusDays(i);
                String label = d.format(DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH));
                points.add(point(label, round1(buckets[i])));
            }
        }

        List<Device> devices = deviceRepository.findByUserId(userId);
        Map<Long, Device> deviceById = new HashMap<>();
        for (Device d : devices) {
            deviceById.put(d.getId(), d);
        }

        List<Map<String, Object>> perDevice = new ArrayList<>();
        for (Map.Entry<Long, Double> e : deviceTotals.entrySet()) {
            Device d = deviceById.get(e.getKey());
            Map<String, Object> item = new HashMap<>();
            item.put("deviceId", e.getKey());
            item.put("name", d != null ? d.getName() : ("Device " + e.getKey()));
            item.put("type", d != null ? d.getType() : "Unknown");
            item.put("consumption", round2(e.getValue()));
            perDevice.add(item);
        }
        perDevice.sort((a, b) -> Double.compare((Double) b.get("consumption"), (Double) a.get("consumption")));

        double total = Arrays.stream(buckets).sum();
        double peak = Arrays.stream(buckets).max().orElse(0.0);
        double avg = bucketCount > 0 ? total / bucketCount : 0.0;

        Map<String, Object> result = new HashMap<>();
        result.put("period", normalized);
        result.put("unit", "kWh");
        result.put("points", points);
        result.put("deviceTotals", perDevice);
        result.put("total", round2(total));
        result.put("peak", round2(peak));
        result.put("average", round2(avg));
        result.put("generatedAt", now.toString());
        return result;
    }

    private static Map<String, Object> point(String time, double consumption) {
        Map<String, Object> p = new HashMap<>();
        p.put("time", time);
        p.put("consumption", consumption);
        return p;
    }

    private static int bucketIndex(String period, LocalDate startDate, LocalDateTime ts) {
        if ("daily".equals(period)) {
            return ts.getHour();
        }
        long days = ChronoUnit.DAYS.between(startDate, ts.toLocalDate());
        return (int) days;
    }

    private static double safe(Double v) {
        return v == null ? 0.0 : v;
    }

    private static double round1(double v) {
        return Math.round(v * 10.0) / 10.0;
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
