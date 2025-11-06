package com.example.backend_service.repository;

import com.example.backend_service.entity.AppUser;
import com.example.backend_service.entity.UserRoom;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRoomRepository extends JpaRepository<UserRoom, Long> {

  List<UserRoom> findByUser_Username(String username);

  void deleteByUser_UsernameAndRoom_RoomId(String username, String roomId);
}
