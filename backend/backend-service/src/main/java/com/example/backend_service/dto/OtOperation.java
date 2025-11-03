package com.example.backend_service.dto;

import lombok.Data;

@Data
public class OtOperation {
  private String type;      // "insert" or "delete"
  private int pos;          // Position to apply operation
  private String value;     // Value inserted (for inserts)
  private int length;       // Length deleted (for deletes)
  private String clientId;  // Unique client instance
  private int baseRevision; // Revision this op is based on
  private Long fileId;      // File ID inside the room

  // Getters and setters
//  public String getType() { return type; }
//  public void setType(String type) { this.type = type; }
//
//  public int getPos() { return pos; }
//  public void setPos(int pos) { this.pos = pos; }
//
//  public String getValue() { return value; }
//  public void setValue(String value) { this.value = value; }
//
//  public int getLength() { return length; }
//  public void setLength(int length) { this.length = length; }
//
//  public String getClientId() { return clientId; }
//  public void setClientId(String clientId) { this.clientId = clientId; }
//
//  public int getBaseRevision() { return baseRevision; }
//  public void setBaseRevision(int baseRevision) { this.baseRevision = baseRevision; }
//
//  public Long getFileId() { return fileId; }
//  public void setFileId(Long fileId) { this.fileId = fileId; }
}
