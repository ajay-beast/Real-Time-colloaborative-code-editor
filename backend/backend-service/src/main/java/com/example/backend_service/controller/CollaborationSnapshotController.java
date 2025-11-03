package com.example.backend_service.controller;

import com.example.backend_service.dto.DocumentState;
import com.example.backend_service.dto.SnapshotResponse;
import com.example.backend_service.repository.EditorFileRepository;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/collab")
public class CollaborationSnapshotController {

  private static final Logger log = LoggerFactory.getLogger(CollaborationSnapshotController.class);
  // Reuse the same map from the WS controller; inject it via a shared bean
  private final Map<String, Map<Long, DocumentState>> roomFileDocs;
  private final EditorFileRepository fileRepository;

  @Autowired
  public CollaborationSnapshotController(Map<String, Map<Long, DocumentState>> roomFileDocs, EditorFileRepository fileRepository) {
    this.roomFileDocs = roomFileDocs;
    this.fileRepository = fileRepository;
  }

  @GetMapping("/rooms/{roomId}/files/{fileId}/snapshot")
  public ResponseEntity<SnapshotResponse> snapshot(
      @PathVariable String roomId,
      @PathVariable Long fileId) {
    roomFileDocs.putIfAbsent(roomId, new ConcurrentHashMap<>());
    Map<Long, DocumentState> files = roomFileDocs.get(roomId);

    DocumentState doc = files.get(fileId);
    if (doc == null) {
      // Seed from DB: implement repository call
      String dbContent = "";
      dbContent = fileRepository.findContentByFileId(fileId);
      log.info("file content from db : {}", dbContent);
      DocumentState seeded = new DocumentState();
      synchronized (seeded) {
        seeded.setContentDirect(dbContent);
        seeded.resetRevision(0); // start at 0
      }
      files.put(fileId, seeded);
      doc = seeded;
    }

    String content;
    int revision;
    synchronized (doc) {
      content = doc.getContent();
      revision = doc.getCurrentRevision();
    }
    return ResponseEntity.ok(new SnapshotResponse(roomId, fileId, content, revision));
  }
}
