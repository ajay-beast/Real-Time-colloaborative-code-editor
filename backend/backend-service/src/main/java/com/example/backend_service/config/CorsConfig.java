package com.example.backend_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

@Configuration
public class CorsConfig implements org.springframework.web.servlet.config.annotation.WebMvcConfigurer {

  @Value("${app.cors.allowed-origins}")
  private String[] allowedOrigins;

  @Value("${app.cors.max-age}")
  private long maxAge;

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
        .allowedOrigins(allowedOrigins)
        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
        .allowedHeaders("*")
        .allowCredentials(true)
        .maxAge(maxAge);
  }

}
