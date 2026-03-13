package com.shems.service;

import com.shems.entity.Device;
import com.shems.repository.DeviceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Objects;

@Service
public class DeviceService {

    @Autowired
    private DeviceRepository deviceRepository;

    public List<Device> getAllDevices() {
        return deviceRepository.findAll();
    }

    public List<Device> getDevicesForUser(Long userId) {
        return deviceRepository.findByUserId(userId);
    }

    @SuppressWarnings("null")
    public Device getDeviceById(Long id) {
        return deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found with id: " + id));
    }

    public Device createDevice(Device device) {
        // Validate required fields
        if (device.getName() == null || device.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Device name is required");
        }
        if (device.getType() == null || device.getType().trim().isEmpty()) {
            throw new IllegalArgumentException("Device type is required");
        }
        if (device.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        
        // Set default values if not provided
        if (device.getStatus() == null) {
            device.setStatus("active");
        }
        if (device.getPowerUsage() == null) {
            device.setPowerUsage(0.0);
        }
        if (device.getOnline() == null) {
            device.setOnline(true);
        }
        if (device.getLocation() == null) {
            device.setLocation("Not specified");
        }
        
        return Objects.requireNonNull(deviceRepository.save(device), "Failed to save device");
    }

    public Device updateDevice(Long id, Device deviceDetails) {
        @SuppressWarnings("null")
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found with id: " + id));

        device.setName(deviceDetails.getName());
        device.setType(deviceDetails.getType());
        device.setStatus(deviceDetails.getStatus());
        device.setPowerUsage(deviceDetails.getPowerUsage());
        device.setLocation(deviceDetails.getLocation());

        return Objects.requireNonNull(deviceRepository.save(device), "Failed to save device");
    }

    @SuppressWarnings("null")
    public void deleteDevice(Long id) {
        @SuppressWarnings("null")
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found with id: " + id));
        deviceRepository.delete(device);
    }

    public List<Device> searchDevicesByName(String name) {
        return deviceRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Device> getDevicesByStatus(String status) {
        return deviceRepository.findByStatus(status);
    }

    public List<Device> getOnlineDevices() {
        return deviceRepository.findByOnline(true);
    }

    public void createDefaultDevices(Long userId) {
        // Create 5 default devices for new users
        String[][] defaultDevices = {
            {"Air Conditioner", "HVAC", "Living Room", "2.5"},
            {"Refrigerator", "Kitchen", "Kitchen", "0.8"},
            {"Smart Lights", "Lighting", "Bedroom", "0.15"},
            {"Television", "Entertainment", "Living Room", "0.3"},
            {"Water Heater", "Appliance", "Bathroom", "4.5"}
        };

        for (String[] deviceData : defaultDevices) {
            Device device = new Device();
            device.setUserId(userId);
            device.setName(deviceData[0]);
            device.setType(deviceData[1]);
            device.setLocation(deviceData[2]);
            device.setPowerUsage(Double.parseDouble(deviceData[3]));
            device.setStatus("active");
            device.setOnline(true);
            
            try {
                createDevice(device);
            } catch (Exception e) {
                System.err.println("Failed to create default device: " + deviceData[0] + " for user: " + userId);
            }
        }
    }
}
