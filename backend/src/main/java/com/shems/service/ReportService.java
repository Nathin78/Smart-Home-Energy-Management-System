package com.shems.service;

import com.shems.entity.Device;
import com.shems.entity.UsageSample;
import com.shems.repository.DeviceRepository;
import com.shems.repository.UsageSampleRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    @Autowired
    private UsageSampleRepository usageSampleRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    private record ReportKey(LocalDate date, Long deviceId) {}

    private record ReportRow(LocalDate date, String deviceName, double energyConsumptionKwh) {}

    public byte[] generateUsageReport(Long userId, LocalDate startDate, LocalDate endDate, String title) throws IOException {
        List<ReportRow> rows = buildReportRows(userId, startDate, endDate);
        return generateExcelReport(rows, title, startDate, endDate);
    }

    private List<ReportRow> buildReportRows(Long userId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = LocalDateTime.of(startDate, LocalTime.MIDNIGHT);
        LocalDateTime end = LocalDateTime.of(endDate, LocalTime.MAX);

        List<UsageSample> samples = usageSampleRepository
                .findByUserIdAndTimestampBetweenOrderByTimestamp(userId, start, end);

        Map<Long, String> deviceNameById = new HashMap<>();
        for (Device d : deviceRepository.findByUserId(userId)) {
            deviceNameById.put(d.getId(), d.getName());
        }

        Map<ReportKey, Double> totals = new HashMap<>();
        for (UsageSample s : samples) {
            if (s.getTimestamp() == null) continue;
            LocalDate d = s.getTimestamp().toLocalDate();
            Long deviceId = s.getDeviceId();
            double kwh = s.getConsumptionKwh() == null ? 0.0 : s.getConsumptionKwh();
            totals.merge(new ReportKey(d, deviceId), kwh, Double::sum);
        }

        Comparator<Map.Entry<ReportKey, Double>> byDateThenDevice = Comparator
                .comparing((Map.Entry<ReportKey, Double> e) -> e.getKey().date(), Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(e -> e.getKey().deviceId(), Comparator.nullsLast(Comparator.naturalOrder()));

        return totals.entrySet().stream()
                .sorted(byDateThenDevice)
                .map(e -> {
                    LocalDate d = e.getKey().date();
                    Long deviceId = e.getKey().deviceId();
                    String name = deviceId != null ? deviceNameById.get(deviceId) : null;
                    if (name == null && deviceId != null) name = "Device " + deviceId;
                    double rounded = Math.round(e.getValue() * 100.0) / 100.0;
                    return new ReportRow(d, name == null ? "" : name, rounded);
                })
                .toList();
    }

    private byte[] generateExcelReport(List<ReportRow> rows, String title, LocalDate startDate, LocalDate endDate) throws IOException {
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
        headerRow.createCell(1).setCellValue("Device Name");
        headerRow.createCell(2).setCellValue("Energy Consumption (kWh)");

        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        for (int i = 0; i < 3; i++) {
            headerRow.getCell(i).setCellStyle(headerStyle);
        }

        // Data
        int rowNum = 4;
        if (rows != null && !rows.isEmpty()) {
            for (ReportRow r : rows) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(r.date != null ? r.date.toString() : "");
                row.createCell(1).setCellValue(r.deviceName != null ? r.deviceName : "");
                row.createCell(2).setCellValue(r.energyConsumptionKwh);
            }
        } else {
            Row row = sheet.createRow(rowNum);
            row.createCell(0).setCellValue("No usage data available for the selected period");
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
}

