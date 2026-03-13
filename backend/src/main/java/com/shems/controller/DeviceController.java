package com.shems.controller;

import com.shems.entity.Device;
import com.shems.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    // GET /api/devices
    @GetMapping
    public ResponseEntity<?> getAllDevices(@RequestParam(required = false) Long userId) {
        try {
            List<Device> devices = (userId != null)
                    ? deviceService.getDevicesForUser(userId)
                    : deviceService.getAllDevices();
            return ResponseEntity.ok(devices);
        } catch (Exception e) {
            return buildError(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // GET /api/devices/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getDeviceById(@PathVariable Long id) {
        try {
            // ✅ No more Optional handling here — service throws exception if not found
            Device device = deviceService.getDeviceById(id);
            return ResponseEntity.ok(device);
        } catch (RuntimeException e) {
            return buildError(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // POST /api/devices
    @PostMapping
    public ResponseEntity<?> createDevice(@RequestBody Device device) {
        try {
            Device created = deviceService.createDevice(device);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return buildError(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return buildError(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // PUT /api/devices/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDevice(@PathVariable Long id, @RequestBody Device deviceDetails) {
        try {
            Device updated = deviceService.updateDevice(id, deviceDetails);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return buildError(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e) {
            return buildError(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // DELETE /api/devices/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDevice(@PathVariable Long id) {
        try {
            deviceService.deleteDevice(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Device deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return buildError(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // GET /api/devices/search?name=fan
    @GetMapping("/search")
    public ResponseEntity<?> searchDevicesByName(@RequestParam String name) {
        try {
            List<Device> devices = deviceService.searchDevicesByName(name);
            return ResponseEntity.ok(devices);
        } catch (Exception e) {
            return buildError(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // GET /api/devices/status?status=active
    @GetMapping("/status")
    public ResponseEntity<?> getDevicesByStatus(@RequestParam String status) {
        try {
            List<Device> devices = deviceService.getDevicesByStatus(status);
            return ResponseEntity.ok(devices);
        } catch (IllegalArgumentException e) {
            return buildError(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return buildError(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // GET /api/devices/online
    @GetMapping("/online")
    public ResponseEntity<?> getOnlineDevices() {
        try {
            List<Device> devices = deviceService.getOnlineDevices();
            return ResponseEntity.ok(devices);
        } catch (Exception e) {
            return buildError(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ Reusable error response builder (matches AuthController style)
    @SuppressWarnings("null")
    private ResponseEntity<Map<String, String>> buildError(String message, HttpStatus status) {
        Map<String, String> error = new HashMap<>();
        error.put("message", message);
        return ResponseEntity.status(status).body(error);
    }
}
