package com.shems.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

import java.time.LocalDate;

@Service
public class EmailService {
    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@shems.local}")
    private String fromEmail;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    public boolean isConfigured() {
        return mailSender != null
                && mailUsername != null
                && !mailUsername.isBlank()
                && mailPassword != null
                && !mailPassword.isBlank();
    }

    public void sendVerificationOTP(String toEmail, String firstName, String otp) {
        try {
            if (!isConfigured()) {
                System.out.println("Email service not configured. OTP for " + toEmail + ": " + otp);
                throw new IllegalStateException("Email service is not configured. Please set SHEMS_MAIL_USERNAME and SHEMS_MAIL_PASSWORD.");
            }

            String subject = "Email Verification OTP - Smart Home Energy Management System";
            String body = "Hello " + firstName + ",\n\n" +
                    "Welcome to the Smart Home Energy Management System!\n\n" +
                    "Your email verification OTP is:\n\n" +
                    "   " + otp + "\n\n" +
                    "This OTP will expire in 10 minutes.\n\n" +
                    "If you did not create this account, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "Smart Home Energy Management System Team";

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            System.out.println("Verification OTP sent successfully to: " + toEmail);
        } catch (IllegalStateException e) {
            // Keep message as-is so the API response tells the user exactly what to configure.
            throw e;
        } catch (Exception e) {
            System.err.println("Failed to send verification OTP: " + e.getMessage());
            System.out.println("OTP for " + toEmail + ": " + otp);
            e.printStackTrace();
            throw new RuntimeException("Failed to send OTP email. Check SMTP credentials/config.", e);
        }
    }

    public void sendPasswordResetOTP(String toEmail, String firstName, String resetToken) {
        try {
            if (!isConfigured()) {
                System.out.println("Email service not configured. Reset token for " + toEmail + ": " + resetToken);
                throw new IllegalStateException("Email service is not configured. Please set SHEMS_MAIL_USERNAME and SHEMS_MAIL_PASSWORD.");
            }

            String subject = "Password Reset OTP - Smart Home Energy Management System";
            String body = "Hello " + firstName + ",\n\n" +
                    "We received a request to reset your password.\n\n" +
                    "Your password reset OTP is:\n\n" +
                    "   " + resetToken + "\n\n" +
                    "This OTP will expire in 10 minutes.\n\n" +
                    "If you did not request a password reset, please ignore this email.\n\n" +
                    "Best regards,\n" +
                    "Smart Home Energy Management System Team";

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            System.out.println("Password reset email sent successfully to: " + toEmail);
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
            System.out.println("Reset OTP for " + toEmail + ": " + resetToken);
            e.printStackTrace();
            throw new RuntimeException("Failed to send password reset OTP email. Check SMTP credentials/config.", e);
        }
    }

    public void sendEnergyAlert(String toEmail, String firstName, LocalDate date, double totalKwh, double thresholdKwh) {
        String subject = "Energy Alert - Smart Home Energy Management System";
        String body = "Hello " + firstName + ",\n\n" +
                "Energy usage alert for " + date + ":\n\n" +
                "Total consumption today: " + totalKwh + " kWh\n" +
                "Alert threshold: " + thresholdKwh + " kWh\n\n" +
                "Tip: Check high-power devices and consider scheduling heavy loads outside peak hours.\n\n" +
                "Best regards,\n" +
                "Smart Home Energy Management System Team";
        sendPlainText(toEmail, subject, body);
    }

    public void sendPeakHourAlert(String toEmail, String firstName, String windowLabel, double windowKwh, double thresholdKwh) {
        String subject = "Peak Hour Alert - Smart Home Energy Management System";
        String body = "Hello " + firstName + ",\n\n" +
                "Peak hour usage alert (" + windowLabel + "):\n\n" +
                "Consumption in the window: " + windowKwh + " kWh\n" +
                "Alert threshold: " + thresholdKwh + " kWh\n\n" +
                "Tip: Try staggering device usage to avoid simultaneous loads.\n\n" +
                "Best regards,\n" +
                "Smart Home Energy Management System Team";
        sendPlainText(toEmail, subject, body);
    }

    public void sendWeeklyReport(String toEmail, String firstName, LocalDate startDate, LocalDate endDate, byte[] excelBytes) {
        String subject = "Weekly Energy Report - Smart Home Energy Management System";
        String body = "Hello " + firstName + ",\n\n" +
                "Your weekly energy report is attached.\n\n" +
                "Period: " + startDate + " to " + endDate + "\n\n" +
                "Best regards,\n" +
                "Smart Home Energy Management System Team";
        sendWithAttachment(
                toEmail,
                subject,
                body,
                "weekly_usage_report_" + startDate + "_to_" + endDate + ".xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                excelBytes
        );
    }

    public void sendMonthlyTargetReached(String toEmail, String firstName, int targetKwh, double currentKwh, LocalDate monthDate) {
        String subject = "Monthly Energy Target Reached - Smart Home Energy Management System";
        String monthLabel = monthDate.format(java.time.format.DateTimeFormatter.ofPattern("MMMM yyyy"));
        String body = "Hello " + firstName + ",\n\n" +
                "You've reached your monthly energy target for " + monthLabel + ".\n\n" +
                "Target: " + targetKwh + " kWh\n" +
                "Current usage: " + currentKwh + " kWh\n\n" +
                "Tip: Review high-usage devices and consider scheduling heavy loads outside peak hours.\n\n" +
                "Best regards,\n" +
                "Smart Home Energy Management System Team";
        sendPlainText(toEmail, subject, body);
    }

    public void sendWelcomeEmail(String toEmail, String firstName) {
        String name = (firstName == null || firstName.isBlank()) ? "there" : firstName.trim();
        String subject = "Welcome to SHEMS!";
        String body = "Hello " + name + ",\n\n" +
                "Welcome to the Smart Home Energy Management System (SHEMS)! We’re excited to have you on board.\n\n" +
                "Your dashboard is ready — explore real-time consumption, manage devices, and set energy goals to save money and go green.\n\n" +
                "If you have any questions, feel free to reach out. We hope you enjoy exploring your dashboard!\n\n" +
                "Best regards,\n" +
                "Smart Home Energy Management System Team";
        sendPlainText(toEmail, subject, body);
    }

    private void sendPlainText(String toEmail, String subject, String body) {
        try {
            if (!isConfigured()) {
                System.out.println("Email service not configured. Would send to " + toEmail + " subject=" + subject);
                System.out.println(body);
                throw new IllegalStateException("Email service is not configured. Please set SHEMS_MAIL_USERNAME and SHEMS_MAIL_PASSWORD.");
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email. Check SMTP credentials/config.", e);
        }
    }

    private void sendWithAttachment(String toEmail, String subject, String body, String filename, String contentType, byte[] bytes) {
        try {
            if (!isConfigured()) {
                System.out.println("Email service not configured. Would send attachment to " + toEmail + ": " + filename + " (" + (bytes == null ? 0 : bytes.length) + " bytes)");
                throw new IllegalStateException("Email service is not configured. Please set SHEMS_MAIL_USERNAME and SHEMS_MAIL_PASSWORD.");
            }

            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true);
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body, false);
            helper.addAttachment(filename, new ByteArrayResource(bytes), contentType);
            mailSender.send(mime);
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email with attachment. Check SMTP credentials/config.", e);
        }
    }
}
