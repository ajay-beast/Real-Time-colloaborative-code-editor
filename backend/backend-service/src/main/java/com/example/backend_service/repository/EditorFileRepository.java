package com.example.backend_service.repository;

import com.example.backend_service.entity.EditorFile;
import com.example.backend_service.entity.EditorRoom;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EditorFileRepository extends JpaRepository<EditorFile, Long> {
  // Find files by room ID
  @Query("SELECT f FROM EditorFile f WHERE f.room.roomId = :roomId ORDER BY f.createdAt ASC")
  List<EditorFile> findByRoomId(@Param("roomId") String roomId);

  // Find file by room ID and file name
  @Query("SELECT f FROM EditorFile f WHERE f.room.roomId = :roomId AND f.fileName = :fileName")
  EditorFile findByRoomIdAndFileName(@Param("roomId") String roomId, @Param("fileName") String fileName);

  // Find files by room (using EditorRoom object)
  @Query("SELECT f FROM EditorFile f WHERE f.room = :room ORDER BY f.fileName ASC")
  List<EditorFile> findByRoom(@Param("room") EditorRoom room);

  // Find files by language
  @Query("SELECT f FROM EditorFile f WHERE f.language = :language")
  List<EditorFile> findByLanguage(@Param("language") String language);

  // Find files by room ID and language
  @Query("SELECT f FROM EditorFile f WHERE f.room.roomId = :roomId AND f.language = :language")
  List<EditorFile> findByRoomIdAndLanguage(@Param("roomId") String roomId, @Param("language") String language);

  // Find files updated after specific date
  @Query("SELECT f FROM EditorFile f WHERE f.updatedAt >= :date ORDER BY f.updatedAt DESC")
  List<EditorFile> findFilesUpdatedAfter(@Param("date") LocalDateTime date);

  // Find recently updated files in a room
  @Query("SELECT f FROM EditorFile f WHERE f.room.roomId = :roomId AND f.updatedAt >= :date ORDER BY f.updatedAt DESC")
  List<EditorFile> findRecentlyUpdatedFilesInRoom(@Param("roomId") String roomId, @Param("date") LocalDateTime date);

  // Count files in a room
  @Query("SELECT COUNT(f) FROM EditorFile f WHERE f.room.roomId = :roomId")
  long countFilesByRoomId(@Param("roomId") String roomId);

  // Find files containing specific text in content (case insensitive)
  @Query("SELECT f FROM EditorFile f WHERE LOWER(f.content) LIKE LOWER(CONCAT('%', :searchText, '%'))")
  List<EditorFile> findFilesContaining(@Param("searchText") String searchText);

  // Find files in room containing specific text
  @Query("SELECT f FROM EditorFile f WHERE f.room.roomId = :roomId AND LOWER(f.content) LIKE LOWER(CONCAT('%', :searchText, '%'))")
  List<EditorFile> findFilesInRoomContaining(@Param("roomId") String roomId, @Param("searchText") String searchText);

  // Check if file exists with name in room
  @Query("SELECT COUNT(f) > 0 FROM EditorFile f WHERE f.room.roomId = :roomId AND f.fileName = :fileName")
  boolean existsByRoomIdAndFileName(@Param("roomId") String roomId, @Param("fileName") String fileName);

  // Find files by file name pattern (useful for extensions)
  @Query("SELECT f FROM EditorFile f WHERE f.fileName LIKE :pattern")
  List<EditorFile> findByFileNamePattern(@Param("pattern") String pattern);

  // Find files with specific extension in room
  @Query("SELECT f FROM EditorFile f WHERE f.room.roomId = :roomId AND f.fileName LIKE CONCAT('%.', :extension)")
  List<EditorFile> findByRoomIdAndFileExtension(@Param("roomId") String roomId, @Param("extension") String extension);

  // Get latest file in room (most recently created)
  @Query("SELECT f FROM EditorFile f WHERE f.room.roomId = :roomId ORDER BY f.createdAt DESC")
  List<EditorFile> findLatestFileInRoom(@Param("roomId") String roomId);

  // Find files with empty content
  @Query("SELECT f FROM EditorFile f WHERE f.content IS NULL OR f.content = ''")
  List<EditorFile> findEmptyFiles();

  // Find files with empty content in specific room
  @Query("SELECT f FROM EditorFile f WHERE f.room.roomId = :roomId AND (f.content IS NULL OR f.content = '')")
  List<EditorFile> findEmptyFilesInRoom(@Param("roomId") String roomId);

  // Delete files in room (for cleanup)
  @Query("DELETE FROM EditorFile f WHERE f.room.roomId = :roomId")
  void deleteAllFilesByRoomId(@Param("roomId") String roomId);

  // Get files created between dates
  @Query("SELECT f FROM EditorFile f WHERE f.createdAt BETWEEN :startDate AND :endDate ORDER BY f.createdAt ASC")
  List<EditorFile> findFilesCreatedBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

  // Find duplicate file names in room (for validation)
  @Query("SELECT f.fileName FROM EditorFile f WHERE f.room.roomId = :roomId GROUP BY f.fileName HAVING COUNT(f.fileName) > 1")
  List<String> findDuplicateFileNamesInRoom(@Param("roomId") String roomId);
}
