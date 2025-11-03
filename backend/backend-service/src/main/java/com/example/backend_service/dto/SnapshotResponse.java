package com.example.backend_service.dto;

public class SnapshotResponse {
  private String roomId;
  private Long fileId;
  private String content;
  private int revision;

  public SnapshotResponse() {}

  public SnapshotResponse(String roomId, Long fileId, String content, int revision) {
    this.roomId = roomId;
    this.fileId = fileId;
    this.content = content;
    this.revision = revision;
  }

  public String getRoomId() { return roomId; }
  public void setRoomId(String roomId) { this.roomId = roomId; }
  public Long getFileId() { return fileId; }
  public void setFileId(Long fileId) { this.fileId = fileId; }
  public String getContent() { return content; }
  public void setContent(String content) { this.content = content; }
  public int getRevision() { return revision; }
  public void setRevision(int revision) { this.revision = revision; }
}
