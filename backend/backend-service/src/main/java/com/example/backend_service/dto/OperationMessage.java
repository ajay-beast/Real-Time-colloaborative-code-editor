package com.example.backend_service.dto;

import lombok.Data;

@Data
public class OperationMessage {
  private String roomId;
  private OtOperation op;

//  // Getters and setters
//  public String getRoomId() { return roomId; }
//  public void setRoomId(String roomId) { this.roomId = roomId; }
//
//  public OtOperation getOp() { return op; }
//  public void setOp(OtOperation op) { this.op = op; }
}
