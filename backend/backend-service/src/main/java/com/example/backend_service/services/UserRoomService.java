package com.example.backend_service.services;

import com.example.backend_service.entity.AppUser;
import com.example.backend_service.entity.EditorRoom;
import com.example.backend_service.entity.UserRoom;
import com.example.backend_service.repository.EditorRoomRepository;
import com.example.backend_service.repository.UserRepository;
import com.example.backend_service.repository.UserRoomRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;
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

  @Autowired
  private UserRepository userRepository;

  public List<UserRoom> getUserRoomsByUserId(String userId) {
    List<UserRoom> userRooms =  userRoomRepository.findByUser_Username(userId);
    userRooms.forEach(userRoom->{
      log.info("room in userroom {} userId : {}", userRoom.getRoom().getRoomId(), userId);
    });
    return userRooms;
  }

  @Transactional
  public void leaveRoom(String roomId, String userId) {
    userRoomRepository.deleteByUser_UsernameAndRoom_RoomId(userId, roomId);
  }

  public void joinRoom(String roomId, String userId) {
    EditorRoom room = editorRoomRepository.findByRoomId(roomId);
    Optional<AppUser> appUser = userRepository.findByUsername(userId);

    if (room == null) {
      throw new IllegalArgumentException("Room not found with ID: " + roomId);
    }

    if(appUser.isEmpty()){
      throw new IllegalArgumentException("User not found for given username : {}" + userId);
    }
    UserRoom userRoom = new UserRoom();
    userRoom.setUser(appUser.get());
    userRoom.setRoom(room);
    userRoom.setCreatedByUser(false);
    userRoomRepository.save(userRoom);
  }
}
