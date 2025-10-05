package com.example.backend_service.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
@Entity
@Table(name = "editor_rooms")
public class EditorRoom {
  @Id
  private String roomId; // UUID

  private String roomName;
  private String creatorId;
  private LocalDateTime createdAt;
  private boolean isActive;

  public EditorRoom() {
    // Default constructor for JPA
  }

  public EditorRoom(String roomId, String roomName, String creatorId) {
    this.roomId = roomId;
    this.roomName = roomName;
    this.creatorId = creatorId;
    this.createdAt = LocalDateTime.now();
    this.isActive = true;
  }

  @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
  private List<EditorFile> files = new ArrayList<>();
}
