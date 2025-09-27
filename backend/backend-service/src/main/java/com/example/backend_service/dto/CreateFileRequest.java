package com.example.backend_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateFileRequest {

  @NotBlank(message = "File name cannot be empty")
  @Size(max = 255, message = "File name cannot exceed 255 characters")
  private String fileName;

  private String content = "";

  @Size(max = 50, message = "Language cannot exceed 50 characters")
  private String language;

  // Constructors
  public CreateFileRequest() {}

  public CreateFileRequest(String fileName, String content, String language) {
    this.fileName = fileName;
    this.content = content;
    this.language = language;
  }

}
