package com.shems.repository;

import com.shems.entity.UsageSample;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UsageSampleRepository extends JpaRepository<UsageSample, Long> {
    List<UsageSample> findByUserIdAndTimestampBetweenOrderByTimestamp(Long userId, LocalDateTime start, LocalDateTime end);
    void deleteByTimestampBefore(LocalDateTime cutoff);
}

