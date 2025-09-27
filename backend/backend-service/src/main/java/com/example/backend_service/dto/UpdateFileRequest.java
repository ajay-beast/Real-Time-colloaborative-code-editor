package com.example.backend_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateFileRequest {
  @NotNull(message = "Content cannot be null")
  private String content;

  private String language;

  // Constructors
  public UpdateFileRequest() {}

  public UpdateFileRequest(String content, String language) {
    this.content = content;
    this.language = language;
  }
}
