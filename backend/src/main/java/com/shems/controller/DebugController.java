package com.shems.controller;

import com.shems.entity.User;
import com.shems.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@SuppressWarnings("unused")
@RestController
public class DebugController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/debug/users")
    public ResponseEntity<List<DebugUser>> listUsers() {
        List<DebugUser> users = userRepository.findAll().stream()
                .map(u -> new DebugUser(u.getId(), u.getEmail(), u.getEmailVerified()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @SuppressWarnings("null")
    @PostMapping("/debug/users/{id}/verify")
    public ResponseEntity<String> verifyUser(@PathVariable Long id) {
        return userRepository.findById(id).map(u -> {
            u.setEmailVerified(true);
            userRepository.save(u);
            return ResponseEntity.ok("verified");
        }).orElse(ResponseEntity.notFound().build());
    }

    public static class DebugUser {
        public Long id;
        public String email;
        public Boolean emailVerified;

        public DebugUser(Long id, String email, Boolean emailVerified) {
            this.id = id;
            this.email = email;
            this.emailVerified = emailVerified;
        }
    }
}
