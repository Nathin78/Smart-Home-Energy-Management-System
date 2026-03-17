package com.shems.service;

import com.shems.dto.*;
import com.shems.entity.User;
import com.shems.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private DeviceService deviceService;

    private static String normalizeEmail(String email) {
        if (email == null) return null;
        String normalized = email.trim().toLowerCase();
        return normalized.isEmpty() ? null : normalized;
    }

    public LoginResponse login(LoginRequest request) throws Exception {
        String email = normalizeEmail(request.getEmail());
        if (email == null) {
            throw new Exception("Email is required");
        }
        Optional<User> optionalUser = userRepository.findByEmailIgnoreCase(email);
        
        if (!optionalUser.isPresent()) {
            throw new Exception("User not found");
        }

        User user = optionalUser.get();
        
        // Check if email is verified
        if (!user.getEmailVerified()) {
            throw new Exception("Email not verified. Please verify your email before logging in");
        }
        
        // Simple password comparison (in production, use BCrypt or similar)
        if (!user.getPassword().equals(request.getPassword())) {
            throw new Exception("Invalid password");
        }

        // Generate a simple JWT token (in production, use proper JWT library)
        String token = generateToken(user.getId());

        UserResponse userResponse = buildUserResponse(user);

        // Send welcome email on first successful login after registration
        if (user.getWelcomeEmailSentAt() == null
                && Boolean.TRUE.equals(user.getEmailVerified())
                && user.getEmail() != null
                && !user.getEmail().isBlank()) {
            try {
                if (emailService.isConfigured()) {
                    emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName());
                    user.setWelcomeEmailSentAt(LocalDateTime.now());
                    userRepository.save(user);
                }
            } catch (Exception e) {
                // Don't block login if email fails
                System.err.println("Failed to send welcome email to userId=" + user.getId() + ": " + e.getMessage());
            }
        }

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUser(userResponse);
        return response;
    }

    public LoginResponse register(RegisterRequest request) throws Exception {
        String email = normalizeEmail(request.getEmail());
        if (email == null) {
            throw new Exception("Email is required");
        }
        Optional<User> existingUser = userRepository.findByEmailIgnoreCase(email);
        
        if (existingUser.isPresent()
            && Boolean.TRUE.equals(existingUser.get().getEmailVerified())
            && !isTemporaryRegistrationRecord(existingUser.get())) {
            throw new Exception("Email already exists");
        }

        User newUser;
        if (existingUser.isPresent()) {
            // Update existing temporary user record
            newUser = existingUser.get();
        } else {
            // Create new user
            newUser = new User();
        }
        
        newUser.setFirstName(request.getFirstName());
        newUser.setLastName(request.getLastName());
        newUser.setEmail(email);
        newUser.setMobileNumber(request.getMobileNumber());
        newUser.setPrimaryInterest(request.getPrimaryInterest());
        newUser.setPassword(request.getPassword());
        
        // Email already verified from OTP step
        newUser.setEmailVerified(true);
        newUser.setVerificationOTP(null);
        newUser.setVerificationOTPExpiry(null);

        User savedUser = userRepository.save(newUser);

        // Create default devices for new user
        deviceService.createDefaultDevices(savedUser.getId());

        String token = generateToken(savedUser.getId());

        UserResponse userResponse = buildUserResponse(savedUser);

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setUser(userResponse);
        return response;
    }

    public String sendOTPToEmail(String email) throws Exception {
        email = normalizeEmail(email);
        if (email == null) {
            throw new Exception("Email is required");
        }
        // Generate OTP
        String otp = generateOTP();
        
        // Check if email already exists
        Optional<User> existingUser = userRepository.findByEmailIgnoreCase(email);
        
        User tempUser;
        if (existingUser.isPresent()) {
            User existing = existingUser.get();
            if (Boolean.TRUE.equals(existing.getEmailVerified()) && !isTemporaryRegistrationRecord(existing)) {
                throw new Exception("Email already exists");
            }
            tempUser = existing;
        } else {
            // Create a temporary entry with OTP (with required fields set)
            tempUser = new User();
            tempUser.setEmail(email);
            tempUser.setFirstName("Pending");
            tempUser.setLastName("Verification");
            tempUser.setPassword("temporary");
            tempUser.setEmailVerified(false);
        }

        tempUser.setVerificationOTP(otp);
        tempUser.setVerificationOTPExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(tempUser);
        
        // Send OTP to email. If mail is not configured or fails, keep running for local dev.
        try {
            emailService.sendVerificationOTP(email, "User", otp);
            return "OTP sent to your email. It will expire in 10 minutes.";
        } catch (IllegalStateException e) {
            return "Email service is not configured. Use this OTP to continue: " + otp + ". It will expire in 10 minutes.";
        } catch (RuntimeException e) {
            System.err.println("Failed to send verification OTP email: " + e.getMessage());
            return "Email could not be sent. Use this OTP to continue: " + otp + ". It will expire in 10 minutes.";
        }
    }

    public String verifyEmail(String otp) throws Exception {
        Optional<User> optionalUser = userRepository.findByVerificationOTP(otp);
        
        if (!optionalUser.isPresent()) {
            throw new Exception("Invalid OTP");
        }

        User user = optionalUser.get();
        
        // Check if OTP is expired
        if (user.getVerificationOTPExpiry() != null && 
            LocalDateTime.now().isAfter(user.getVerificationOTPExpiry())) {
            throw new Exception("OTP has expired. Please request a new one.");
        }

        // Mark email as verified
        user.setEmailVerified(true);
        user.setVerificationOTP(null);
        user.setVerificationOTPExpiry(null);
        userRepository.save(user);

        return "Email verified successfully";
    }

    private String generateToken(Long userId) {
        // Simple token generation (in production, use proper JWT library like jjwt)
        return "token_" + userId + "_" + UUID.randomUUID().toString();
    }

    private String generateOTP() {
        // Generate a 6-digit OTP
        int otp = 100000 + (int)(Math.random() * 900000);
        return String.valueOf(otp);
    }

    private boolean isTemporaryRegistrationRecord(User user) {
        return "temporary".equals(user.getPassword())
            || ("Pending".equals(user.getFirstName()) && "Verification".equals(user.getLastName()));
    }

    private UserResponse buildUserResponse(User user) {
        return new UserResponse(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail(),
            user.getMobileNumber(),
            user.getPrimaryInterest(),
            user.getProfilePhoto(),
            user.getAddressLine1(),
            user.getAddressLine2(),
            user.getCity(),
            user.getState(),
            user.getPostalCode(),
            user.getCountry(),
            user.getDateOfBirth(),
            user.getOccupation(),
            user.getBio()
        );
    }

    public String resetPassword(String email) throws Exception {
        email = normalizeEmail(email);
        if (email == null) {
            throw new Exception("Email is required");
        }
        Optional<User> optionalUser = userRepository.findByEmailIgnoreCase(email);
        
        if (!optionalUser.isPresent()) {
            throw new Exception("Email not found in our system");
        }

        User user = optionalUser.get();
        
        // Generate a password reset OTP
        String resetOTP = generateOTP();
        user.setVerificationOTP(resetOTP);
        user.setVerificationOTPExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);
        
        // Send reset OTP to email. If mail is not configured or fails, keep running for local dev.
        try {
            emailService.sendPasswordResetOTP(email, user.getFirstName(), resetOTP);
            return "OTP for password reset has been sent to your email. It will expire in 10 minutes.";
        } catch (IllegalStateException e) {
            return "Email service is not configured. Use this reset OTP to continue: " + resetOTP + ". It will expire in 10 minutes.";
        } catch (RuntimeException e) {
            System.err.println("Failed to send reset OTP email: " + e.getMessage());
            return "Email could not be sent. Use this reset OTP to continue: " + resetOTP + ". It will expire in 10 minutes.";
        }
    }

    public String verifyPasswordResetOTP(String otp, String newPassword) throws Exception {
        Optional<User> optionalUser = userRepository.findByVerificationOTP(otp);
        
        if (!optionalUser.isPresent()) {
            throw new Exception("Invalid OTP");
        }

        User user = optionalUser.get();
        
        // Check if OTP is expired
        if (user.getVerificationOTPExpiry() != null && 
            LocalDateTime.now().isAfter(user.getVerificationOTPExpiry())) {
            throw new Exception("OTP has expired. Please request a new one.");
        }

        // Update password and clear OTP
        user.setPassword(newPassword);
        user.setVerificationOTP(null);
        user.setVerificationOTPExpiry(null);
        userRepository.save(user);

        return "Password has been reset successfully";
    }
}
