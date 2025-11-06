package com.example.backend_service.controller;

import com.example.backend_service.dto.AuthResponse;
import com.example.backend_service.dto.SigninRequest;
import com.example.backend_service.dto.SignupRequest;
import com.example.backend_service.entity.AppUser;
import com.example.backend_service.repository.UserRepository;
import com.example.backend_service.services.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private static final Logger log = LoggerFactory.getLogger(AuthController.class);
  private final UserRepository users;
  private final PasswordEncoder encoder;
  private final JwtUtil jwt;

  @Autowired
  public AuthController(UserRepository users, PasswordEncoder encoder, JwtUtil jwt) {
    this.users = users; this.encoder = encoder; this.jwt = jwt;
  }

  @PostMapping("/signup")
  public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest req) {
    if (users.findByUsername(req.getUsername()).isPresent()) {
      return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }
    AppUser u = new AppUser();
    u.setUsername(req.getUsername());
    u.setPasswordHash(encoder.encode(req.getPassword()));
    u.setDisplayName(req.getDisplayName());
    users.save(u);

    String token = jwt.generateToken(u.getUsername());
    return ResponseEntity.ok(new AuthResponse(token, u.getUsername(), u.getDisplayName()));
  }

  @PostMapping("/signin")
  public ResponseEntity<AuthResponse> signin(@RequestBody SigninRequest req) {
    AppUser u = users.findByUsername(req.getUsername())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    if (!encoder.matches(req.getPassword(), u.getPasswordHash())) {
      log.info("password did not match");
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }
    String token = jwt.generateToken(u.getUsername());
    return ResponseEntity.ok(new AuthResponse(token, u.getUsername(), u.getDisplayName()));
  }
}
