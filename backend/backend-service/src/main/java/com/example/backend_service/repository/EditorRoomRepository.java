package com.example.backend_service.repository;

import com.example.backend_service.entity.EditorRoom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EditorRoomRepository extends JpaRepository<EditorRoom, String> {
  // Find room by roomId
  EditorRoom findByRoomId(String roomId);

  // Check if room exists by roomId
  boolean existsByRoomId(String roomId);

  // Find all active rooms
  @Query("SELECT r FROM EditorRoom r WHERE r.isActive = true")
  List<EditorRoom> findAllActiveRooms();



  // Find rooms created after a specific date
  @Query("SELECT r FROM EditorRoom r WHERE r.createdAt >= :date")
  List<EditorRoom> findRoomsCreatedAfter(@Param("date") LocalDateTime date);

  // Find room by roomId only if active
  @Query("SELECT r FROM EditorRoom r WHERE r.roomId = :roomId AND r.isActive = true")
  Optional<EditorRoom> findActiveRoomById(@Param("roomId") String roomId);

  // Count total rooms
  long count();

  // Count active rooms
  @Query("SELECT COUNT(r) FROM EditorRoom r WHERE r.isActive = true")
  long countActiveRooms();

  // Find rooms by name (case insensitive)
  @Query("SELECT r FROM EditorRoom r WHERE LOWER(r.roomName) LIKE LOWER(CONCAT('%', :name, '%'))")
  List<EditorRoom> findRoomsByNameContaining(@Param("name") String name);

  // Delete inactive rooms older than specified date
  @Query("DELETE FROM EditorRoom r WHERE r.isActive = false AND r.createdAt < :date")
  void deleteInactiveRoomsOlderThan(@Param("date") LocalDateTime date);
}
