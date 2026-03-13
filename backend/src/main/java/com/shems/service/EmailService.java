package com.shems.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

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

    public void sendVerificationOTP(String toEmail, String firstName, String otp) {
        try {
            if (mailSender == null || mailUsername == null || mailUsername.isBlank() || mailPassword == null || mailPassword.isBlank()) {
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
            if (mailSender == null || mailUsername == null || mailUsername.isBlank() || mailPassword == null || mailPassword.isBlank()) {
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
}
