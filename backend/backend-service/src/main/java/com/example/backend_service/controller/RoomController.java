package com.example.backend_service.controller;


import com.example.backend_service.dto.CreateRoomRequest;
import com.example.backend_service.entity.EditorRoom;
import com.example.backend_service.services.RoomService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

  @Autowired
  private RoomService roomService;

  @PostMapping
  public ResponseEntity<EditorRoom> createRoom(@Valid @RequestBody CreateRoomRequest request) {
    EditorRoom room = roomService.createRoom(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(room);
  }

  @GetMapping("/{roomId}")
  public ResponseEntity<EditorRoom> getRoom(@PathVariable String roomId) {
    EditorRoom room = roomService.getRoomById(roomId);
    return ResponseEntity.ok(room);
  }

  @GetMapping("/{roomId}/exists")
  public ResponseEntity<Boolean> roomExists(@PathVariable String roomId) {
    boolean exists = roomService.roomExists(roomId);
    return ResponseEntity.ok(exists);
  }

  @PutMapping("/{roomId}")
  public ResponseEntity<EditorRoom> updateRoom(
      @PathVariable String roomId,
      @RequestParam String roomName) {
    EditorRoom room = roomService.updateRoom(roomId, roomName);
    return ResponseEntity.ok(room);
  }

  @DeleteMapping("/{roomId}")
  public ResponseEntity<Void> deactivateRoom(@PathVariable String roomId) {
    roomService.deactivateRoom(roomId);
    return ResponseEntity.noContent().build();
  }
}
