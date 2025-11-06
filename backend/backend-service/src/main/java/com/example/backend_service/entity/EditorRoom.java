package com.example.backend_service.entity;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
@Entity
@Table(name = "editor_rooms")
@JsonIdentityInfo(
    generator = ObjectIdGenerators.PropertyGenerator.class,
    property = "roomId"
)
public class EditorRoom {
  @Id
  private String roomId; // UUID

  private String roomName;
  private LocalDateTime createdAt;
  private boolean isActive;

  public EditorRoom() {
    // Default constructor for JPA
  }

  public EditorRoom(String roomId, String roomName, AppUser creator) {
    this.roomId = roomId;
    this.roomName = roomName;
    this.creator = creator;
    this.createdAt = LocalDateTime.now();
    this.isActive = true;
  }

  @OneToMany(mappedBy = "room", cascade = CascadeType.ALL)
  private List<EditorFile> files = new ArrayList<>();

  @OneToMany(mappedBy="room", cascade = CascadeType.ALL)
  private List<UserRoom> userRooms = new ArrayList<>();

  @ManyToOne
  @JoinColumn(name = "creator_username", referencedColumnName = "username")
  private AppUser creator;
}
