package com.shems.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "usage_samples")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsageSample {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "device_id", nullable = false)
    private Long deviceId;

    @Column(name = "sample_ts", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "consumption_kwh", nullable = false)
    private Double consumptionKwh;
}

