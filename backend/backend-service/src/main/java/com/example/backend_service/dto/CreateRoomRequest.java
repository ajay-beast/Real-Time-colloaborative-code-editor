package com.example.backend_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateRoomRequest {
  @NotBlank(message = "Room name cannot be empty")
  @Size(max = 255, message = "Room name cannot exceed 255 characters")
  private String roomName;

  private String creatorId;

  // Constructors
  public CreateRoomRequest() {}

  public CreateRoomRequest(String roomName, String creatorId) {
    this.roomName = roomName;
    this.creatorId = creatorId;
  }
}
