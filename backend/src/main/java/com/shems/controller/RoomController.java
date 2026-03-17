package com.shems.controller;

import com.shems.entity.Room;
import com.shems.repository.RoomRepository;
import com.shems.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/rooms")
public class RoomController {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getRooms(@RequestParam Long userId) {
        try {
            if (!userRepository.existsById(userId)) {
                return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            }
            List<Room> rooms = roomRepository.findByUserId(userId);
            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> addRoom(@RequestParam Long userId, @RequestBody Map<String, String> request) {
        try {
            if (!userRepository.existsById(userId)) {
                return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            }
            String name = request.get("name");
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Room name is required"));
            }
            String normalized = name.trim();
            if (normalized.length() > 60) {
                return ResponseEntity.badRequest().body(Map.of("message", "Room name must be 60 characters or less"));
            }
            if (roomRepository.existsByUserIdAndNameIgnoreCase(userId, normalized)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Room already exists"));
            }

            Room room = new Room();
            room.setUserId(userId);
            room.setName(normalized);
            Room saved = roomRepository.save(room);

            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Room added");
            resp.put("room", saved);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }
}
