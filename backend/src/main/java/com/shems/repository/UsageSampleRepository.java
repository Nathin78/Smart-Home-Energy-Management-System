package com.shems.repository;

import com.shems.entity.UsageSample;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UsageSampleRepository extends JpaRepository<UsageSample, Long> {
    List<UsageSample> findByUserIdAndTimestampBetweenOrderByTimestamp(Long userId, LocalDateTime start, LocalDateTime end);
    void deleteByTimestampBefore(LocalDateTime cutoff);

    @Query("SELECT SUM(s.consumptionKwh) FROM UsageSample s WHERE s.userId = :userId AND s.timestamp BETWEEN :start AND :end")
    Double sumKwhForUserBetween(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT SUM(s.consumptionKwh) FROM UsageSample s WHERE s.userId = :userId AND s.deviceId IN :deviceIds AND s.timestamp BETWEEN :start AND :end")
    Double sumKwhForUserAndDevicesBetween(
            @Param("userId") Long userId,
            @Param("deviceIds") List<Long> deviceIds,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
