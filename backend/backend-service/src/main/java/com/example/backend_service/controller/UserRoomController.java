package com.example.backend_service.controller;

import com.example.backend_service.entity.UserRoom;
import com.example.backend_service.services.UserRoomService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/userrooms")
public class UserRoomController {

  @Autowired
  private  UserRoomService userRoomService;

  // GET /api/userrooms/user/{userId}
  @GetMapping("/user/{userId}")
  public ResponseEntity<List<UserRoom>> getUserRoomsByUserId(@PathVariable String userId) {
    List<UserRoom> userRooms = userRoomService.getUserRoomsByUserId(userId);
    return ResponseEntity.ok(userRooms);
  }

  // POST /api/userrooms/{roomId}/leave
  @PostMapping("/{roomId}/leave")
  public ResponseEntity<Void> leaveRoom(
      @PathVariable String roomId,
      @RequestBody LeaveRoomRequest request
  ) {
    userRoomService.leaveRoom(roomId, request.getUserId());
    return ResponseEntity.ok().build();
  }

  @PostMapping("/{roomId}/join")
  public ResponseEntity<Void> joinRoom(
      @PathVariable String roomId,
      @RequestBody LeaveRoomRequest request
  ) {
    userRoomService.joinRoom(roomId, request.getUserId());
    return ResponseEntity.ok().build();
  }


  // Request body class for leaving room
  public static class LeaveRoomRequest {
    private String userId;
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
  }
}
