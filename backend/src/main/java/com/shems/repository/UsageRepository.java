package com.shems.repository;

import com.shems.entity.Usage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface UsageRepository extends JpaRepository<Usage, Long> {

    List<Usage> findByDeviceIdAndDateBetween(Long deviceId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT u FROM Usage u WHERE u.deviceId IN :deviceIds AND u.date BETWEEN :startDate AND :endDate ORDER BY u.date")
    List<Usage> findUsageForDevicesInDateRange(@Param("deviceIds") List<Long> deviceIds,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(u.dailyConsumption) FROM Usage u WHERE u.deviceId IN :deviceIds AND u.date BETWEEN :startDate AND :endDate")
    Double getTotalConsumptionForDevices(@Param("deviceIds") List<Long> deviceIds,
                                         @Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);
}