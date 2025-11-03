package com.example.backend_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    // Clients subscribe to /topic/*
    config.enableSimpleBroker("/topic");

    // Clients send to /app/*
    config.setApplicationDestinationPrefixes("/app");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    // WebSocket endpoint for connecting, with CORS allowed for frontend origin
    registry.addEndpoint("/ws")
        .setAllowedOriginPatterns("*")
        .withSockJS();
  }
}
