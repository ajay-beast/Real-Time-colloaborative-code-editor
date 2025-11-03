package com.example.backend_service.controller;

import static java.util.Collections.copy;

import com.example.backend_service.dto.DocumentState;
import com.example.backend_service.dto.JoinMessage;
import com.example.backend_service.dto.OperationMessage;
import com.example.backend_service.dto.OtOperation;
import com.example.backend_service.services.UserRoomService;
import java.util.List;
import java.util.Map;
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
  @Autowired
  private SimpMessagingTemplate messagingTemplate;

  @Autowired
  private UserRoomService userRoomService;

  // Map<roomId, Map<fileId, DocumentState>>
  private final Map<String, Map<Long, DocumentState>> roomFileDocs = new ConcurrentHashMap<>();

  @MessageMapping("/join")
  public void joinFileSession(JoinMessage msg) {
    // Validate user belongs to the room, prevent unauthorized join
//    if (!userRoomService.isUserInRoom(msg.getUserId(), msg.getRoomId())) {
//      System.out.println("User " + msg.getUserId() + " is not authorized for room " + msg.getRoomId());
//      return;
//    }

    roomFileDocs.putIfAbsent(msg.getRoomId(), new ConcurrentHashMap<>());
    Map<Long, DocumentState> files = roomFileDocs.get(msg.getRoomId());
    files.putIfAbsent(msg.getFileId(), new DocumentState());
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
    }
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
