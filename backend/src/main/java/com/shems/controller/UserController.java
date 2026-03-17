package com.shems.controller;

import com.shems.dto.ProfileUpdateRequest;
import com.shems.dto.UserResponse;
import com.shems.entity.User;
import com.shems.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserRepository userRepository;

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody ProfileUpdateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getFirstName() != null) {
            String firstName = request.getFirstName().trim();
            if (firstName.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "First name cannot be empty"));
            }
            user.setFirstName(firstName);
        }

        if (request.getLastName() != null) {
            String lastName = request.getLastName().trim();
            if (lastName.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Last name cannot be empty"));
            }
            user.setLastName(lastName);
        }

        if (request.getEmail() != null) {
            String email = request.getEmail().trim().toLowerCase();
            if (email.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email cannot be empty"));
            }
            Optional<User> existing = userRepository.findByEmailIgnoreCase(email);
            if (existing.isPresent() && !existing.get().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
            }
            user.setEmail(email);
        }

        if (request.getMobileNumber() != null) {
            user.setMobileNumber(request.getMobileNumber().trim());
        }

        if (request.getProfilePhoto() != null) {
            user.setProfilePhoto(request.getProfilePhoto());
        }

        if (request.getAddressLine1() != null) {
            user.setAddressLine1(request.getAddressLine1().trim());
        }
        if (request.getAddressLine2() != null) {
            user.setAddressLine2(request.getAddressLine2().trim());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity().trim());
        }
        if (request.getState() != null) {
            user.setState(request.getState().trim());
        }
        if (request.getPostalCode() != null) {
            user.setPostalCode(request.getPostalCode().trim());
        }
        if (request.getCountry() != null) {
            user.setCountry(request.getCountry().trim());
        }
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getOccupation() != null) {
            user.setOccupation(request.getOccupation().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }

        User saved = userRepository.save(user);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Profile updated successfully");
        result.put("user", toUserResponse(saved));
        return ResponseEntity.ok(result);
    }

    private UserResponse toUserResponse(User user) {
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
}
