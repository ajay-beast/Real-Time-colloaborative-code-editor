package com.example.backend_service.dto;

public class JoinMessage {
  private String roomId;
  private Long fileId;
  private String userId;

  // Getters and setters
  public String getRoomId() { return roomId; }
  public void setRoomId(String roomId) { this.roomId = roomId; }

  public Long getFileId() { return fileId; }
  public void setFileId(Long fileId) { this.fileId = fileId; }

  public String getUserId() { return userId; }
  public void setUserId(String userId) { this.userId = userId; }
}
