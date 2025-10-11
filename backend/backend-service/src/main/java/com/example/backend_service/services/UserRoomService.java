package com.example.backend_service.services;

import com.example.backend_service.entity.EditorRoom;
import com.example.backend_service.entity.UserRoom;
import com.example.backend_service.repository.EditorRoomRepository;
import com.example.backend_service.repository.UserRoomRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserRoomService {

  private static final Logger log = LoggerFactory.getLogger(UserRoomService.class);
  @Autowired
  private UserRoomRepository userRoomRepository;

  @Autowired
  private EditorRoomRepository editorRoomRepository;

  public List<UserRoom> getUserRoomsByUserId(String userId) {
    List<UserRoom> userRooms =  userRoomRepository.findByUserId(userId);
    userRooms.forEach(userRoom->{
      log.info("room in userroom {} userId : {}", userRoom.getRoom().getRoomId(), userId);
    });
    return userRooms;
  }

  @Transactional
  public void leaveRoom(String roomId, String userId) {
    userRoomRepository.deleteByUserIdAndRoom_RoomId(userId, roomId);
  }

  public void joinRoom(String roomId, String userId) {
    EditorRoom room = editorRoomRepository.findByRoomId(roomId);
    if (room == null) {
      throw new IllegalArgumentException("Room not found with ID: " + roomId);
    }
    UserRoom userRoom = new UserRoom();
    userRoom.setUserId(userId);
    userRoom.setRoom(room);
    userRoom.setCreatedByUser(false);
    userRoomRepository.save(userRoom);
  }
}
