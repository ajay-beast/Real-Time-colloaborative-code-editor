package com.example.backend_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

public  EditorFile() {
    // Default constructor for JPA
  }

public EditorFile(String fileName, String content, String language) {
    this.fileName = fileName;
    this.content = content;
    this.language = language;
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
  }
  @JsonIgnore
  @ManyToOne
  @JoinColumn(name = "room_id", nullable = false)
  private EditorRoom room;
}
