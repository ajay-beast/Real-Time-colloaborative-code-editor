package com.example.backend_service.dto;

import lombok.Data;

@Data
public class AuthResponse {
  private String token;
  private String username;
  private String displayName;

  public AuthResponse(String token, String username, String displayName) {
    this.token = token;
    this.username = username;
    this.displayName = displayName;
  }
}
