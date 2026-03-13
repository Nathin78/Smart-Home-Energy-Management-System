package com.shems.config;

import com.shems.entity.User;
import com.shems.repository.UserRepository;
import com.shems.service.DeviceService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initializeData(UserRepository userRepository, DeviceService deviceService) {
        return args -> {
            // Check if users already exist
            if (userRepository.count() == 0) {
                // Create John Doe
                User user1 = new User();
                user1.setFirstName("John");
                user1.setLastName("Doe");
                user1.setEmail("john@example.com");
                user1.setMobileNumber("9876543210");
                user1.setPassword("password123");
                user1.setPrimaryInterest("Energy Monitoring");
                user1.setCreatedAt(LocalDateTime.now());
                user1.setUpdatedAt(LocalDateTime.now());
                user1.setEmailVerified(true);  // Mark as verified
                User saved1 = userRepository.save(user1);
                deviceService.createDefaultDevices(saved1.getId());

                // Create Jane Smith
                User user2 = new User();
                user2.setFirstName("Jane");
                user2.setLastName("Smith");
                user2.setEmail("jane@example.com");
                user2.setMobileNumber("9876543211");
                user2.setPassword("password123");
                user2.setPrimaryInterest("Cost Reduction");
                user2.setCreatedAt(LocalDateTime.now());
                user2.setUpdatedAt(LocalDateTime.now());
                user2.setEmailVerified(true);  // Mark as verified
                User saved2 = userRepository.save(user2);
                deviceService.createDefaultDevices(saved2.getId());

                // Create Bob Johnson
                User user3 = new User();
                user3.setFirstName("Bob");
                user3.setLastName("Johnson");
                user3.setEmail("bob@example.com");
                user3.setMobileNumber("9876543212");
                user3.setPassword("password123");
                user3.setPrimaryInterest("Solar Integration");
                user3.setCreatedAt(LocalDateTime.now());
                user3.setUpdatedAt(LocalDateTime.now());
                user3.setEmailVerified(true);  // Mark as verified
                User saved3 = userRepository.save(user3);
                deviceService.createDefaultDevices(saved3.getId());

                System.out.println("✅ Test users created successfully!");
            } else {
                System.out.println("✅ Users already exist in database");

                // Ensure each existing user has default devices (useful for demos after schema changes).
                for (User u : userRepository.findAll()) {
                    try {
                        if (deviceService.getDevicesForUser(u.getId()).isEmpty()) {
                            deviceService.createDefaultDevices(u.getId());
                        }
                    } catch (Exception ignored) {
                        // Best-effort seeding; don't block startup.
                    }
                }
            }
        };
    }

}
