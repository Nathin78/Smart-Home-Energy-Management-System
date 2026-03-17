package com.shems.service;

import com.shems.entity.Device;
import com.shems.entity.Usage;
import com.shems.repository.DeviceRepository;
import com.shems.repository.UsageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsageService {

    @Autowired
    private UsageRepository usageRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    public Usage recordDailyUsage(Long deviceId, Double consumption) {
        Usage usage = new Usage();
        usage.setDeviceId(deviceId);
        usage.setDate(LocalDate.now());
        usage.setDailyConsumption(consumption);
        return usageRepository.save(usage);
    }

    public List<Usage> getUsageForDevice(Long deviceId, LocalDate startDate, LocalDate endDate) {
        return usageRepository.findByDeviceIdAndDateBetween(deviceId, startDate, endDate);
    }

    public List<Usage> getUsageForUserDevices(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Long> deviceIds = deviceRepository.findByUserId(userId)
                .stream()
                .map(Device::getId)
                .collect(Collectors.toList());
        if (deviceIds.isEmpty()) {
            return Collections.emptyList();
        }
        return usageRepository.findUsageForDevicesInDateRange(deviceIds, startDate, endDate);
    }

    public Double getTotalConsumptionForUser(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Long> deviceIds = deviceRepository.findByUserId(userId)
                .stream()
                .map(Device::getId)
                .collect(Collectors.toList());
        if (deviceIds.isEmpty()) {
            return 0.0;
        }
        Double total = usageRepository.getTotalConsumptionForDevices(deviceIds, startDate, endDate);
        return total != null ? total : 0.0;
    }
}
