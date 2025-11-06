package com.example.backend_service.services;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {
  @Value("${jwt.secret}") private String secret;
  @Value("${jwt.expMinutes:120}") private long expMinutes;

  public String generateToken(String username) {
    Instant now = Instant.now();
    return Jwts.builder()
        .setSubject(username)
        .setIssuedAt(Date.from(now))
        .setExpiration(Date.from(now.plus(expMinutes, ChronoUnit.MINUTES)))
        .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS256)
        .compact();
  }

  public String validateAndGetSubject(String token) {
    return Jwts.parserBuilder()
        .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
        .build()
        .parseClaimsJws(token)
        .getBody()
        .getSubject();
  }
}
