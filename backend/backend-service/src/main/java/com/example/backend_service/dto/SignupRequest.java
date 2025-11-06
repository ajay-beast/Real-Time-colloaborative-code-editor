package com.example.backend_service.dto;

import lombok.Data;

@Data
public class SignupRequest {
  private String username;
  private String password;
  private String displayName;
}
