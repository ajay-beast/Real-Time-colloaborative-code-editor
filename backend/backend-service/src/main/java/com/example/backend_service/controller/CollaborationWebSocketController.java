package com.example.backend_service.controller;

import static java.util.Collections.copy;

import com.example.backend_service.dto.DocumentState;
import com.example.backend_service.dto.JoinMessage;
import com.example.backend_service.dto.OperationMessage;
import com.example.backend_service.dto.OtOperation;
import com.example.backend_service.repository.EditorFileRepository;
import com.example.backend_service.services.UserRoomService;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CollaborationWebSocketController {

  private static final Logger log = LoggerFactory.getLogger(CollaborationWebSocketController.class);

  private SimpMessagingTemplate messagingTemplate;

  private UserRoomService userRoomService;

  // Map<roomId, Map<fileId, DocumentState>>
  private Map<String, Map<Long, DocumentState>> roomFileDocs = new ConcurrentHashMap<>();

  private EditorFileRepository fileRepository;

  // Debounced persistence state
  private final Map<String, Map<Long, Long>> lastPersistAt = new ConcurrentHashMap<>();
  private final long DEBOUNCE_MS = 1500; // 1.5s after the last op per (roomId, fileId)


  @Autowired
  public CollaborationWebSocketController(
      SimpMessagingTemplate messagingTemplate,
      Map<String, Map<Long, DocumentState>> roomFileDocs, UserRoomService userRoomService, EditorFileRepository fileRepository) {
    this.messagingTemplate = messagingTemplate;
    this.roomFileDocs = roomFileDocs;
    this.userRoomService = userRoomService;
    this.fileRepository = fileRepository;
  }

  @MessageMapping("/join")
  public void joinFileSession(JoinMessage msg) {
    roomFileDocs.putIfAbsent(msg.getRoomId(), new ConcurrentHashMap<>());
    Map<Long, DocumentState> files = roomFileDocs.get(msg.getRoomId());
    files.computeIfAbsent(msg.getFileId(), id -> {
      // Seed from DB
      String dbContent  = "";
      dbContent = fileRepository.findContentByFileId(id);
      log.info("file content while joining from db : {}", dbContent);
      DocumentState seeded = new DocumentState();
      synchronized (seeded) {
        seeded.setContentDirect(dbContent);
        seeded.resetRevision(0);
      }
      return seeded;
    });
    log.info("User {} joined file {} in room {}", msg.getUserId(), msg.getFileId(), msg.getRoomId());
  }

  @MessageMapping("/operation")
  public void handleOperation(OperationMessage message) {
    String roomId = message.getRoomId();
    OtOperation incomingOp = message.getOp();
    long fileId = incomingOp.getFileId();
    log.info("Received operation for room {}, file {}: {}", roomId, fileId, incomingOp);
    roomFileDocs.putIfAbsent(roomId, new ConcurrentHashMap<>());
    Map<Long, DocumentState> files = roomFileDocs.get(roomId);
    files.putIfAbsent(fileId, new DocumentState());

    DocumentState doc = files.get(fileId);

    synchronized (doc) {
      List<OtOperation> concurrentOps = doc.getOpsSince(incomingOp.getBaseRevision());
      OtOperation transformedOp = transform(incomingOp, concurrentOps);
      doc.apply(transformedOp);
      doc.appendOp(transformedOp);

      int newRevision = doc.getCurrentRevision();
      transformedOp.setBaseRevision(newRevision);
      // Broadcast to all clients subscribed to this room topic
      log.info("Broadcasting transformed operation for room {}, file {}: {}", roomId, fileId, transformedOp);
      messagingTemplate.convertAndSend("/topic/room." + roomId, transformedOp);
      scheduleDebouncedPersist(roomId, fileId, doc);
    }
  }

  private void scheduleDebouncedPersist(String roomId, long fileId, DocumentState doc) {
    long now = System.currentTimeMillis();
    lastPersistAt.putIfAbsent(roomId, new ConcurrentHashMap<>());
    Map<Long, Long> times = lastPersistAt.get(roomId);
    times.put(fileId, now);

    // Run async; replace with your TaskExecutor if available
    CompletableFuture.runAsync(() -> {
      try { Thread.sleep(DEBOUNCE_MS); } catch (InterruptedException ignored) {}

      Long last = times.get(fileId);
      if (last == null) return;

      // Only persist if no newer ops arrived in the debounce window and doc is dirty
      if ((System.currentTimeMillis() - last) >= DEBOUNCE_MS && doc.isDirty()) {
        String content;
        synchronized (doc) {
          content = doc.getContent();
          doc.markPersisted();
        }
        try {
          fileRepository.updateContentByFileId(fileId, content); // implement/update this repository method
          log.info("Persisted file {} content ({} chars) to DB (room {})", fileId, content.length(), roomId);
        } catch (Exception e) {
          log.error("Failed to persist file {}: {}", fileId, e.getMessage(), e);
          doc.setDirty();
          // Optionally: keep doc dirty so it will be retried on next schedule
        }
      }
    });
  }


  // Simplified OT transform example
  private OtOperation transform(OtOperation inc, List<OtOperation> con) {
    OtOperation op = inc;
    for (OtOperation ex : con) {
      if ("insert".equals(ex.getType()) && "insert".equals(op.getType())) {
        if (ex.getPos() < op.getPos() || (ex.getPos() == op.getPos() && ex.getClientId().compareTo(op.getClientId()) < 0)) {
          op.setPos(op.getPos() + ex.getValue().length());
        }
      } else if ("insert".equals(ex.getType()) && "delete".equals(op.getType())) {
        if (ex.getPos() < op.getPos()) {
          op.setPos(op.getPos() + ex.getValue().length());
        }
      } else if ("delete".equals(ex.getType()) && "insert".equals(op.getType())) {
        if (ex.getPos() < op.getPos()) {
          int shift = Math.min(ex.getLength(), Math.max(0, op.getPos() - ex.getPos()));
          op.setPos(op.getPos() - shift);
        }
      } else if ("delete".equals(ex.getType()) && "delete".equals(op.getType())) {
        int exStart = ex.getPos();
        int exEnd = ex.getPos() + ex.getLength();
        int opStart = op.getPos();
        int opEnd = op.getPos() + op.getLength();

        if (exEnd <= opStart) {
          // ex left of op
          op.setPos(op.getPos() - ex.getLength());
        } else if (exStart >= opEnd) {
          // ex right of op
        } else {
          // overlap
          int overlapStart = Math.max(exStart, opStart);
          int overlapEnd = Math.min(exEnd, opEnd);
          int overlap = Math.max(0, overlapEnd - overlapStart);
          op.setLength(op.getLength() - overlap);
          if (exStart < opStart) {
            op.setPos(op.getPos() - Math.min(ex.getLength(), opStart - exStart));
          }
        }
      }
    }
    return op;
  }
}
