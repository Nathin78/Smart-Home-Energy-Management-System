package com.shems.controller;

import com.shems.service.UsageService;
import com.shems.service.ConsumptionService;
import com.shems.entity.Device;
import com.shems.repository.DeviceRepository;
import com.shems.repository.UsageSampleRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private UsageService usageService;

    @Autowired
    private ConsumptionService consumptionService;

    @Autowired
    private UsageSampleRepository usageSampleRepository;

    @Autowired
    private DeviceRepository deviceRepository;

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
            LocalDateTime monthStart = LocalDateTime.of(now.toLocalDate().minusDays(29), LocalTime.MIDNIGHT);

            double todayKwh = usageSampleRepository.findByUserIdAndTimestampBetweenOrderByTimestamp(userId, todayStart, now)
                    .stream()
                    .mapToDouble(s -> s.getConsumptionKwh() == null ? 0.0 : s.getConsumptionKwh())
                    .sum();

            double monthKwh = usageSampleRepository.findByUserIdAndTimestampBetweenOrderByTimestamp(userId, monthStart, now)
                    .stream()
                    .mapToDouble(s -> s.getConsumptionKwh() == null ? 0.0 : s.getConsumptionKwh())
                    .sum();

            double monthlyAverage = monthKwh / 30.0;
            double tariffInrPerKwh = 8.0;
            double monthlyCost = monthKwh * tariffInrPerKwh;

            List<Device> devices = deviceRepository.findByUserId(userId);
            long activeDevices = devices.stream().filter(d -> {
                if (Boolean.FALSE.equals(d.getOnline())) return false;
                String status = d.getStatus() == null ? "active" : d.getStatus().toLowerCase(Locale.ROOT);
                return !"inactive".equals(status);
            }).count();

            stats.put("todayConsumption", Math.round(todayKwh * 10.0) / 10.0);
            stats.put("monthlyAverage", Math.round(monthlyAverage * 10.0) / 10.0);
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
            LocalDate startDate = endDate.minusWeeks(1).plusDays(1);

            List<com.shems.entity.Usage> usages = usageService.getUsageForUserDevices(userId, startDate, endDate);

            byte[] excelData = generateExcelReport(usages, "Weekly Electricity Usage Report", startDate, endDate);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "weekly_usage_report.xlsx");
            headers.setContentLength(excelData.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/report/monthly")
    public ResponseEntity<byte[]> downloadMonthlyReport(@RequestParam Long userId) {
        try {
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusMonths(1).plusDays(1);

            List<com.shems.entity.Usage> usages = usageService.getUsageForUserDevices(userId, startDate, endDate);

            byte[] excelData = generateExcelReport(usages, "Monthly Electricity Usage Report", startDate, endDate);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "monthly_usage_report.xlsx");
            headers.setContentLength(excelData.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    private byte[] generateExcelReport(List<com.shems.entity.Usage> usages, String title, LocalDate startDate, LocalDate endDate) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Usage Report");

        // Title
        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue(title);
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 14);
        titleStyle.setFont(titleFont);
        titleCell.setCellStyle(titleStyle);

        // Period
        Row periodRow = sheet.createRow(1);
        periodRow.createCell(0).setCellValue("Period: " + startDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + " to " + endDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));

        // Headers
        Row headerRow = sheet.createRow(3);
        headerRow.createCell(0).setCellValue("Date");
        headerRow.createCell(1).setCellValue("Device ID");
        headerRow.createCell(2).setCellValue("Daily Consumption (kWh)");

        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        for (int i = 0; i < 3; i++) {
            headerRow.getCell(i).setCellStyle(headerStyle);
        }

        // Data
        int rowNum = 4;
        if (usages != null && !usages.isEmpty()) {
            for (com.shems.entity.Usage usage : usages) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(usage.getDate().toString());
                row.createCell(1).setCellValue(usage.getDeviceId());
                row.createCell(2).setCellValue(usage.getDailyConsumption());
            }
        } else {
            // Mock data if no real data
            String[][] mockData = {
                {"2026-03-03", "1", "5.2"},
                {"2026-03-04", "1", "4.8"},
                {"2026-03-05", "1", "6.1"},
                {"2026-03-06", "1", "5.5"},
                {"2026-03-07", "1", "4.9"},
                {"2026-03-08", "1", "5.7"},
                {"2026-03-09", "1", "6.3"}
            };

            for (String[] data : mockData) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(data[0]);
                row.createCell(1).setCellValue(data[1]);
                row.createCell(2).setCellValue(data[2]);
            }
        }

        // Auto-size columns
        for (int i = 0; i < 3; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        return outputStream.toByteArray();
    }

    private ResponseEntity<?> buildError(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("message", message);
        return ResponseEntity.status(500).body(error);
    }
}
