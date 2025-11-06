package com.example.backend_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class AppUser {

  @Id
  @GeneratedValue
  private Long id;

  @Column(unique = true, nullable = false)
  private String username;

  @Column(nullable = false)
  private String passwordHash;

  private String displayName;
  private Instant createdAt = Instant.now();

  public  AppUser() {
    // Default constructor for JPA
  }
}
