package com.shems.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "mobile_number")
    private String mobileNumber;

    @Lob
    @Column(name = "profile_photo", columnDefinition = "LONGTEXT")
    private String profilePhoto;

    @Column(name = "address_line1")
    private String addressLine1;

    @Column(name = "address_line2")
    private String addressLine2;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "country")
    private String country;

    @Column(name = "date_of_birth")
    private String dateOfBirth;

    @Column(name = "occupation")
    private String occupation;

    @Lob
    @Column(name = "bio", columnDefinition = "LONGTEXT")
    private String bio;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "primary_interest")
    private String primaryInterest;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified = false;

    @Column(name = "verification_otp")
    private String verificationOTP;

    @Column(name = "verification_otp_expiry")
    private LocalDateTime verificationOTPExpiry;

    @Column(name = "notify_energy_alerts", nullable = false)
    private Boolean notifyEnergyAlerts = true;

    @Column(name = "notify_email_notifications", nullable = false)
    private Boolean notifyEmailNotifications = true;

    @Column(name = "notify_weekly_reports", nullable = false)
    private Boolean notifyWeeklyReports = true;

    @Column(name = "notify_peak_alerts", nullable = false)
    private Boolean notifyPeakAlerts = false;

    @Column(name = "monthly_target_kwh")
    private Integer monthlyTargetKwh;

    @Column(name = "last_energy_alert_at")
    private LocalDateTime lastEnergyAlertAt;

    @Column(name = "last_peak_alert_at")
    private LocalDateTime lastPeakAlertAt;

    @Column(name = "last_weekly_report_at")
    private LocalDateTime lastWeeklyReportAt;

    @Column(name = "last_monthly_target_alert_at")
    private LocalDateTime lastMonthlyTargetAlertAt;

    @Column(name = "welcome_email_sent_at")
    private LocalDateTime welcomeEmailSentAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
