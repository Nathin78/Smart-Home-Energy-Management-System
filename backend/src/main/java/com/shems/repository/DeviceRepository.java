package com.shems.repository;

import com.shems.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {
    List<Device> findByNameContainingIgnoreCase(String name);
    List<Device> findByStatus(String status);
    List<Device> findByOnline(Boolean online);
    List<Device> findByUserId(Long userId);
}
