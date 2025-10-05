package com.example.backend_service.services;


import com.example.backend_service.dto.CreateRoomRequest;
import com.example.backend_service.entity.EditorRoom;
import com.example.backend_service.exception.ResourceNotFoundException;
import com.example.backend_service.repository.EditorRoomRepository;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RoomService {
  @Autowired
  private EditorRoomRepository roomRepository;

  public EditorRoom createRoom(CreateRoomRequest request) {
    String roomId = UUID.randomUUID().toString();

    // Ensure unique room ID (very unlikely to collide, but safe check)
    while (roomRepository.existsByRoomId(roomId)) {
      roomId = UUID.randomUUID().toString();
    }

    EditorRoom room = new EditorRoom(roomId, request.getRoomName(), request.getCreatorId());
    return roomRepository.save(room);
  }

  @Transactional(readOnly = true)
  public EditorRoom getRoomById(String roomId) {
    EditorRoom room = roomRepository.findByRoomId(roomId);
    if (room == null) {
      throw new ResourceNotFoundException("Room not found with ID: " + roomId);
    }
    return room;
  }

  @Transactional(readOnly = true)
  public boolean roomExists(String roomId) {
    return roomRepository.existsByRoomId(roomId);
  }

  public EditorRoom updateRoom(String roomId, String roomName) {
    EditorRoom room = getRoomById(roomId);
    room.setRoomName(roomName);
    return roomRepository.save(room);
  }

  public void deactivateRoom(String roomId) {
    EditorRoom room = getRoomById(roomId);
    room.setActive(false);
    roomRepository.save(room);
  }
}
