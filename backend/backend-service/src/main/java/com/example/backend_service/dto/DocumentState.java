package com.example.backend_service.dto;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class DocumentState {
  private String content = "";
  private final List<OtOperation> operationLog = new ArrayList<>();
  private int currentRevision = 0;
  private volatile boolean dirty = false;

  public synchronized void apply(OtOperation op) {
    if ("insert".equals(op.getType())) {
      int pos = op.getPos();
      if (pos < 0 || pos > content.length()) {
        pos = content.length(); // safety fallback
      }
      this.content = content.substring(0, pos) + op.getValue() + content.substring(pos);
    } else if ("delete".equals(op.getType())) {
      int pos = op.getPos();
      int length = op.getLength();
      if (pos < 0 || pos + length > content.length()) {
        return; // ignore bad deletes
      }
      this.content = content.substring(0, pos) + content.substring(pos + length);
    }
  }

  public synchronized void appendOp(OtOperation op) {
    operationLog.add(op);
    currentRevision++;
    dirty = true;
  }

  public synchronized List<OtOperation> getOpsSince(int revision) {
    if (revision < 0 || revision >= operationLog.size()) {
      return Collections.emptyList();
    }
    return operationLog.subList(revision, operationLog.size());
  }

  public synchronized String getContent() {
    return content;
  }

  public synchronized int getCurrentRevision() { return currentRevision; }

  public synchronized boolean isDirty() {
    return dirty;
  }

  public synchronized void markPersisted() {
    dirty = false;
  }

  public synchronized void setContentDirect(String content) {
    this.content = content != null ? content : "";
  }

  public synchronized void resetRevision(int rev) {
    this.currentRevision = Math.max(0, rev);
    this.operationLog.clear();
    this.dirty = false;
  }
}
