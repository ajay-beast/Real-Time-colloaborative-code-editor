package com.example.backend_service.services;

import com.example.backend_service.dto.CreateFileRequest;
import com.example.backend_service.dto.UpdateFileRequest;
import com.example.backend_service.entity.EditorFile;
import com.example.backend_service.entity.EditorRoom;
import com.example.backend_service.exception.ResourceNotFoundException;
import com.example.backend_service.repository.EditorFileRepository;
import com.example.backend_service.repository.EditorRoomRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class FileService {

  @Autowired
  private EditorFileRepository fileRepository;

  @Autowired
  private EditorRoomRepository roomRepository;

  public EditorFile createFile(String roomId, CreateFileRequest request) {
    // Check if room exists
    EditorRoom room = roomRepository.findByRoomId(roomId);
    if (room == null) {
      throw new ResourceNotFoundException("Room not found with ID: " + roomId);
    }

    // Check if file with same name already exists in the room
    EditorFile existingFile = fileRepository.findByRoomIdAndFileName(roomId, request.getFileName());
    if (existingFile != null) {
      throw new IllegalArgumentException(
          "File with name '" + request.getFileName() + "' already exists in this room");
    }

    // Determine language from file extension if not provided
    String language = request.getLanguage();
    if (language == null || language.trim().isEmpty()) {
      language = determineLanguageFromFileName(request.getFileName());
    }

    // Create new file
    EditorFile file = new EditorFile(
        request.getFileName(),
        request.getContent() != null ? request.getContent() : "",
        language
    );
    file.setRoom(room);
    return fileRepository.save(file);
  }

  @Transactional(readOnly = true)
  public List<EditorFile> getFilesByRoom(String roomId) {
    // Verify room exists
    if (!roomRepository.existsByRoomId(roomId)) {
      throw new ResourceNotFoundException("Room not found with ID: " + roomId);
    }

    return fileRepository.findByRoomId(roomId);
  }

  public EditorFile updateFile(Long fileId, UpdateFileRequest request) {
    EditorFile file = fileRepository.findById(fileId)
        .orElseThrow(() -> new ResourceNotFoundException("File not found with ID: " + fileId));

    // Update content
    file.setContent(request.getContent());

    // Update language if provided
    if (request.getLanguage() != null && !request.getLanguage().trim().isEmpty()) {
      file.setLanguage(request.getLanguage());
    }

    return fileRepository.save(file);
  }

  @Transactional(readOnly = true)
  public EditorFile getFileById(Long fileId) {
    return fileRepository.findById(fileId)
        .orElseThrow(() -> new ResourceNotFoundException("File not found with ID: " + fileId));
  }

  public void deleteFile(Long fileId) {
    EditorFile file = getFileById(fileId);
    fileRepository.delete(file);
  }

  // Helper method to determine language from file extension
  private String determineLanguageFromFileName(String fileName) {
    if (fileName == null || !fileName.contains(".")) {
      return "plaintext";
    }

    String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();

    switch (extension) {
      // C++
      case "cpp":
      case "cc":
      case "cxx":
      case "c++":
        return "cpp";

      // Java
      case "java":
        return "java";

      // Python
      case "py":
        return "python";

      // JavaScript
      case "js":
      case "jsx":
        return "javascript";

      // HTML
      case "html":
      case "htm":
        return "html";

      // CSS
      case "css":
        return "css";

      default:
        return "plaintext";
    }
  }
}
