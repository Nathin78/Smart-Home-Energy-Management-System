package com.shems.repository;

import com.shems.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByUserId(Long userId);
    boolean existsByUserIdAndNameIgnoreCase(Long userId, String name);
}
