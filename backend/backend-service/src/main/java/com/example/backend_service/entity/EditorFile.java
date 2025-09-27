package com.example.backend_service.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Data;

@Data
@Entity
@Table(name = "editor_files")
public class EditorFile {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String fileName;
  private String content;
  private String language; // java, javascript, python etc
  private String roomId;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public EditorFile(String fileName, String content, String language, String roomId) {
    this.fileName = fileName;
    this.content = content;
    this.language = language;
    this.roomId = roomId;
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
  }
}
