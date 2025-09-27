package com.example.backend_service.controller;

import com.example.backend_service.dto.CreateFileRequest;
import com.example.backend_service.dto.UpdateFileRequest;
import com.example.backend_service.entity.EditorFile;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/files")
public class FileController {
  @Autowired
  private FileService fileService;

  @PostMapping("/room/{roomId}")
  public ResponseEntity<EditorFile> createFile(
      @PathVariable String roomId,
      @RequestBody CreateFileRequest request) {

    EditorFile file = fileService.createFile(roomId, request);
    return ResponseEntity.ok(file);
  }

  @GetMapping("/room/{roomId}")
  public ResponseEntity<List<EditorFile>> getFilesByRoom(
      @PathVariable String roomId) {

    return ResponseEntity.ok(fileService.getFilesByRoom(roomId));
  }

  @PutMapping("/{fileId}")
  public ResponseEntity<EditorFile> updateFile(
      @PathVariable Long fileId,
      @RequestBody UpdateFileRequest request) {

    return ResponseEntity.ok(fileService.updateFile(fileId, request));
  }
}
