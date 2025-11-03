package com.example.backend_service.config;

import com.example.backend_service.dto.DocumentState;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CollabStateConfig {
  @Bean
  public Map<String, Map<Long, DocumentState>> roomFileDocs() {
    return new ConcurrentHashMap<>();
  }
}
