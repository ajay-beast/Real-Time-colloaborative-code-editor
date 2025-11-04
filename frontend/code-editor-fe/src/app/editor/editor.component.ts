import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileService } from '../services/file.service';
import { RoomService } from '../services/room.service';
import { UserroomService } from '../services/userroom.service';
import {
  CollabServiceService,
  OtOperation,
} from '../services/collab-service.service';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit {
  editorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    fontSize: 14,
    automaticLayout: true,
    minimap: { enabled: true },
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    lineNumbers: 'on',
    formatOnType: true,
    formatOnPaste: true,
  };

  currentContent = '';
  currentFile: any = null;
  files: any[] = [];
  editor: any;
  currentRoomId: string = '';
  currentRoom: any = null;
  isFileModified = false;
  showCreateFileDialog = false;
  newFileName = '';
  isLoading = true; // New loading state
  userId = 'user321'; // your user ID
  userRooms: any[] = [];
  showRoomList = false;
  showJoinRoomDialog = false;
  pendingJoinRoomId: string | null = null;

  /* variables for collab edit */
  clientId = Math.random().toString(36).substring(2);
  fileRevisionMap: { [fileId: number]: number } = {};
  suspendedLocalEdit = false;
  isInitializingFile = false;
private modelsByFileId = new Map<number, any>();
private firstChangeDisposerByFileId = new Map<number, any>();
private roomSubscribed = new Set<string>(); // roomId subscribed topics



  constructor(
    private fileService: FileService,
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router,
    private userroomService: UserroomService,
    private collabService: CollabServiceService
  ) {}

  ngOnInit() {
    this.loadUserRooms();

    /* collab edit setup --------------------------------- */

    this.collabService.connect('http://localhost:8080/ws');
    this.collabService.onRemoteOp().subscribe(({ roomId, op }) => {
      console.log(
        'Received remote op in editor: ' +
          op +
          ' for room: ' +
          roomId +
          ' currentRoomId: ' +
          this.currentRoomId
      );
      console.log(
        'current clientId: ' + this.clientId + ' op clientId: ' + op.clientId
      );
      // if (
      //   roomId === this.currentRoomId &&
      //   this.currentFile &&
      //   op.fileId === this.currentFile.id &&
      //   op.clientId !== this.clientId
      // ) {
      //   console.log('Applying remote operation:', op);
      //   this.applyRemoteOp(op);
      //   this.fileRevisionMap[this.currentFile.id] =
      //     (this.fileRevisionMap[this.currentFile.id] || 0) + 1;
      // }
      if (roomId === this.currentRoomId &&
    this.currentFile &&
    op.fileId === this.currentFile.id
  ) {
    if (op.clientId !== this.clientId) {
      console.log('Applying remote operation:', op);
      this.applyRemoteOp(op);
    }
    // CHANGE: set revision to server's reported value directly
    this.fileRevisionMap[this.currentFile.id] = op.baseRevision;
  }
    });

    // Join current file session if loaded
    if (this.currentRoomId && this.currentFile) {
      // this.collabService.joinFileSession(this.currentRoomId, this.currentFile.id, this.userId);
      this.collabService.onConnected$.subscribe(() => {
        console.log('WebSocket connected — now joining file session');
        if (this.currentRoomId && this.currentFile) {
          this.collabService.joinFileSession(
            this.currentRoomId,
            this.currentFile.id,
            this.userId
          );
        }
      });
    }
  }

  loadUserRooms() {
    this.userroomService.getUserRooms(this.userId).subscribe({
      next: (userrooms) => {
        this.userRooms = userrooms;
        console.log('Loaded user rooms:', this.userRooms);

        const roomIdFromRoute = this.route.snapshot.paramMap.get('roomId');
        console.log('Room ID from route:', roomIdFromRoute);

        if (roomIdFromRoute && roomIdFromRoute.trim()) {
          const alreadyInRoom = this.userRooms.some(
            (r) => r.room?.roomId?.trim() === roomIdFromRoute.trim()
          );

          console.log('Is user already in room?', alreadyInRoom);

          if (!alreadyInRoom) {
            this.showJoinRoomDialog = true;
            this.pendingJoinRoomId = roomIdFromRoute;
            return;
          } else {
            this.currentRoomId = roomIdFromRoute.trim();
            localStorage.setItem('currentRoomId', this.currentRoomId);
          }
        }

        // If no roomId set, but rooms exist, set first as active
        if (!this.currentRoomId && userrooms.length > 0) {
          this.switchRoom(userrooms[0].room);
          return;
        }

        // Continue workspace setup
        this.initializeWorkspace();
      },
      error: (e) => {
        console.error('Failed to load user rooms', e);
        this.initializeWorkspace(); // fallback init
      },
    });
  }

  switchRoom(room: any) {
    if (this.currentRoomId === room.roomId) return;
    // if (this.isFileModified) {
    //   if (!confirm('You have unsaved changes. Continue without saving?'))
    //     return;
    // }

    this.currentRoomId = room.roomId;
    this.currentRoom = room;
    console.log('Switched to room:', room);
    localStorage.setItem('currentRoomId', this.currentRoomId);

    this.clearCurrentFile();
    this.loadFiles();
    this.showRoomList = false;
  }

  clearCurrentFile() {
    this.currentFile = null;
    this.currentContent = '';
    this.isFileModified = false;
  }

  toggleRoomList() {
    this.showRoomList = !this.showRoomList;
  }

  leaveRoom(userroom: any) {
    if (userroom.createdByUser) {
      alert('Creators cannot leave their own rooms.');
      return;
    }
    if (confirm(`Leave room "${userroom.room.roomName}"?`)) {
      this.userroomService
        .leaveRoom(userroom.room.roomId, this.userId)
        .subscribe({
          next: () => {
            this.userRooms = this.userRooms.filter(
              (r) => r.room.roomId !== userroom.room.roomId
            );
            if (this.currentRoomId === userroom.room.roomId) {
              // Switch to another room or clear
              if (this.userRooms.length > 0) {
                this.switchRoom(this.userRooms[0].room);
              } else {
                this.clearCurrentFile();
                this.currentRoomId = '';
                this.currentRoom = null;
                localStorage.removeItem('currentRoomId');
              }
            }
          },
          error: (err) => alert(`Failed to leave room: ${err.message || err}`),
        });
    }
  }

  // Create a brand new room with user-provided name
  newRoom() {
    // const proceed = confirm(
    //   'Create a new room? Your current unsaved changes will be lost.'
    // );
    // if (!proceed) {
    //   return;
    // }

    const name = prompt('Enter a name for your room:', 'My Coding Workspace');

    // Clear local state
    this.currentFile = null;
    this.currentContent = '';
    this.files = [];
    this.isFileModified = false;

    // Clear stored room and create anew
    localStorage.removeItem('currentRoomId');
    this.createRoom(name || undefined);
  }

  // Initialize workspace - create room if needed, then load files
  initializeWorkspace() {
    this.isLoading = true;

    // get room id from local storage
    this.currentRoomId = localStorage.getItem('currentRoomId') || '';
    console.log('Current room ID from local storage:', this.currentRoomId);

    if (!this.currentRoomId) {
      this.createRoom();
      return;
    }
    // First check if room exists
    this.roomService.roomExists(this.currentRoomId).subscribe({
      next: (exists) => {
        if (exists) {
          // Room exists, load it and files
          this.loadRoom();
        } else {
          // Room doesn't exist, create it
          if (!this.currentRoomId) {
            this.createRoom();
          }
        }
      },
      error: (error) => {
        console.error('Error checking room:', error);
        // // If check fails, try to create room if user
        // if(!this.currentRoomId){
        //     this.createRoom();
        // }
      },
    });
  }

  // Create a new room (optionally using a provided room name)
  createRoom(roomName?: string) {
    const createRoomRequest = {
      roomName:
        roomName && roomName.trim() ? roomName.trim() : 'My Coding Workspace',
      creatorId: this.userId, // Simple user ID for now
    };

    this.roomService
      .createRoom(createRoomRequest.roomName, createRoomRequest.creatorId)
      .subscribe({
        next: (room) => {
          this.currentRoom = room;
          this.currentRoomId = room.roomId; // Use the generated room ID
          console.log('Room created successfully:', room);
          // this.loadFiles();
          this.loadRoom();
          localStorage.setItem('currentRoomId', this.currentRoomId);
        },
        error: (error) => {
          console.error('Error creating room:', error);
          // If room creation fails, still try to load files with hardcoded ID
          // this.currentRoom = { roomName: 'Default Workspace', roomId: this.currentRoomId };
          // this.loadFiles();
        },
      });
  }

  // Load existing room
  loadRoom() {
    this.roomService.getRoom(this.currentRoomId).subscribe({
      next: (room) => {
        this.currentRoom = room;
        console.log('Room loaded successfully:', room);
        this.loadFiles();
      },
      error: (error) => {
        console.error('Error loading room:', error);
        // If loading fails, create new room
        // this.createRoom();
      },
    });
  }

  // Load files for current room
  loadFiles() {
    this.fileService.getFilesByRoom(this.currentRoomId).subscribe({
      next: (files) => {
        this.files = files;
        console.log('Files loaded:', files.length);

        // Open first file if available
         // If currentFile is gone, select the first available
      if (this.files.length > 0) {
        if (!this.currentFile || !this.files.some(f => f.id === this.currentFile.id)) {
          this.openFile(this.files[0]);
        }
      } else {
        this.clearCurrentFile();
      }

        this.isLoading = false; // Hide loading state
      },
      error: (error) => {
        console.error('Error loading files:', error);
        // Even if file loading fails, show the editor
        this.files = [];
       this.clearCurrentFile();
        this.isFileModified = false;
        this.isLoading = false;
      },
    });
  }

  // Monaco editor initialization stable version
  // onEditorInit(editor: any) {
  //   this.editor = editor;
  //   console.log('Monaco Editor initialized');
  //   // Listen for content changes
  //   // editor.onDidChangeModelContent(() => {
  //   //   if (this.currentFile) {
  //   //     this.isFileModified = true;
  //   //   }
  //   // });

  //   /* changes for collab edit ----------------------------*/

  //   editor.onDidChangeModelContent((event: any) => {
  //   console.log(`[onDidChangeModelContent] start | isInitializingFile=${this.isInitializingFile}, suspendedLocalEdit=${this.suspendedLocalEdit}, isFileModified=${this.isFileModified}, changes=`, event.changes);

  // if (!this.currentFile) {
  //   console.log('[onDidChangeModelContent] No currentFile, returning');
  //   return;
  // }
  // if (this.suspendedLocalEdit) {
  //   console.log('[onDidChangeModelContent] suspendedLocalEdit=true, returning');
  //   return;
  // }
  // if (this.isInitializingFile) {
  //   console.log('[onDidChangeModelContent] isInitializingFile=true, returning (not sending ops)');
  //   return;
  // }

  //     const fileId = this.currentFile.id;
  //     let baseRevision = this.fileRevisionMap[fileId] || 0;

  //     for (const change of event.changes.sort(
  //       (a: any, b: any) => a.rangeOffset - b.rangeOffset
  //     )) {
  //       if (change.rangeLength > 0) {
  //         this.collabService.sendOp({
  //           type: 'delete',
  //           pos: change.rangeOffset,
  //           length: change.rangeLength,
  //           clientId: this.clientId,
  //           baseRevision,
  //           fileId,
  //           roomId: this.currentRoomId,
  //         });
  //         baseRevision += 1;
  //       }
  //       if (change.text.length > 0) {
  //         this.collabService.sendOp({
  //           type: 'insert',
  //           pos: change.rangeOffset,
  //           value: change.text,
  //           clientId: this.clientId,
  //           baseRevision,
  //           fileId,
  //           roomId: this.currentRoomId,
  //         });
  //         baseRevision += 1;
  //       }
  //     }

  //     // this.fileRevisionMap[fileId] = baseRevision;
  //     this.isFileModified = true;
  //   });
  // }

  onEditorInit(editor: any) {
  this.editor = editor;
  console.log('Monaco Editor initialized');

  editor.onDidChangeModelContent((event: any) => {
    // Strong guards to prevent sending programmatic changes
    if (!this.currentFile) {
      return;
    }
    if (this.suspendedLocalEdit) {
      return;
    }
    if (this.isInitializingFile) {
      return;
    }

    const fileId = this.currentFile.id;
    let baseRevision = this.fileRevisionMap[fileId] ?? 0;

    // Send changes in ascending offset order
    for (const change of event.changes.sort((a: any, b: any) => a.rangeOffset - b.rangeOffset)) {
      if (change.rangeLength > 0) {
        this.collabService.sendOp({
          type: 'delete',
          pos: change.rangeOffset,
          length: change.rangeLength,
          clientId: this.clientId,
          baseRevision,
          fileId,
          roomId: this.currentRoomId,
        });
        baseRevision += 1;
      }
      if (change.text && change.text.length > 0) {
        this.collabService.sendOp({
          type: 'insert',
          pos: change.rangeOffset,
          value: change.text,
          clientId: this.clientId,
          baseRevision,
          fileId,
          roomId: this.currentRoomId,
        });
        baseRevision += 1;
      }
    }

    // Do not set fileRevisionMap here; let server echo decide
    this.isFileModified = true;
  });
}


  // Handle content changes
  onContentChange(content: string) {
    if (this.currentFile && content !== this.currentFile.content) {
      this.isFileModified = true;
    }
  }

  // Open a file stable version
// openFile(file: any) {
//   console.log(`[openFile] isFileModified=${this.isFileModified}, isInitializingFile=${this.isInitializingFile}, suspendedLocalEdit=${this.suspendedLocalEdit}`);
//   // Save changes if any
//   if (this.isFileModified) {
//     console.log('[openFile] Unsaved changes, saving...');
//     this.saveFile();
//   }
//   this.isInitializingFile = true; // Begin init
//   console.log(`[openFile] Setting isInitializingFile=true for file ${file.fileName}`);

//   this.currentFile = file;
//   this.currentContent = file.content;
//   this.isFileModified = false;

//   const model = this.editor?.getModel();
//   if (model) {
//     const fullRange = model.getFullModelRange();
//     this.suspendedLocalEdit = true;
//     console.log(`[openFile] [APPLY] Setting model content for ${file.fileName}`);
//     model.applyEdits([{ range: fullRange, text: this.currentContent }]);
//     this.suspendedLocalEdit = false;
//     console.log(`[openFile] [APPLY_DONE] Finished setting model content`);
//   }

//   this.updateEditorLanguage(file.fileName);
//   this.fileRevisionMap[file.id] = 0;

//   this.collabService.joinFileSession(this.currentRoomId, file.id, this.userId);

//   setTimeout(() => {
//     this.isInitializingFile = false;
//     console.log(`[openFile] isInitializingFile=false (after content load)`);
//   }, 0);
// }

openFile(file: any) {
  // Save current file if needed
  if (this.isFileModified) {
    // this.saveFile();
  }

  this.currentFile = file;
  this.isFileModified = false;

  // Ensure editor is ready
  if (!this.editor) {
    const wait = setInterval(() => {
      if (this.editor) {
        clearInterval(wait);
        this.openFile(file);
      }
    }, 10);
    return;
  }

  console.log("[openFile] calling getSnapshot for file:", file.fileName);
  // 1) Fetch authoritative snapshot (content + revision)
  this.fileService.getSnapshot(this.currentRoomId, file.id).subscribe({
    next: (snapshot) => {
      const snapshotContent = snapshot?.content ?? (file.content || '');
      const snapshotRevision = snapshot?.revision ?? 0;

      // 2) Prepare model and suppress outbound ops while setting content
      let model = this.modelsByFileId.get(file.id);
      const language = this.getLanguageFromFileName(file.fileName);

      this.isInitializingFile = true;
      this.suspendedLocalEdit = true;

      if (!model) {
        model = (window as any).monaco.editor.createModel(snapshotContent, language);
        this.modelsByFileId.set(file.id, model);

        // One-time listener to clear init only after Monaco's first model change
        const disposer = model.onDidChangeContent(() => {
          if (this.isInitializingFile) {
            this.isInitializingFile = false;
          }
          disposer.dispose();
          this.firstChangeDisposerByFileId.delete(file.id);
        });
        this.firstChangeDisposerByFileId.set(file.id, disposer);
      } else {
        // Update model if content differs (avoid unnecessary change events)
        if (model.getValue() !== snapshotContent) {
          model.setValue(snapshotContent);
        }
        // Ensure a one-time disposer exists to clear init on first change
        if (!this.firstChangeDisposerByFileId.has(file.id)) {
          const disposer = model.onDidChangeContent(() => {
            if (this.isInitializingFile) {
              this.isInitializingFile = false;
            }
            disposer.dispose();
            this.firstChangeDisposerByFileId.delete(file.id);
          });
          this.firstChangeDisposerByFileId.set(file.id, disposer);
        }
      }

      // 3) Attach model and language to the single Monaco instance
      this.editor.setModel(model);
      // after this.editor.setModel(model);
console.log('[openFile] snapshot applied: len=', model.getValue().length, 'rev=', snapshotRevision);

      (window as any).monaco.editor.setModelLanguage(model, language);

      // 4) Initialize revision from snapshot (authoritative)
      this.fileRevisionMap[file.id] = snapshotRevision;

      // 5) Join WS session AFTER snapshot is applied
      this.collabService.joinFileSession(this.currentRoomId, file.id, this.userId);

      // 6) Release suppression; if Monaco didn't fire a change, clear init here
      queueMicrotask(() => {
        this.suspendedLocalEdit = false;
        if (this.isInitializingFile) {
          this.isInitializingFile = false;
        }
      });
    },
    error: (err) => {
      console.error('[openFile] Snapshot fetch failed, falling back to DB content', err);

      // Fallback to previous logic with file.content if snapshot unavailable
      let model = this.modelsByFileId.get(file.id);
      const language = this.getLanguageFromFileName(file.fileName);

      this.isInitializingFile = true;
      this.suspendedLocalEdit = true;

      const content = file.content || '';

      if (!model) {
        model = (window as any).monaco.editor.createModel(content, language);
        this.modelsByFileId.set(file.id, model);
        const disposer = model.onDidChangeContent(() => {
          if (this.isInitializingFile) {
            this.isInitializingFile = false;
          }
          disposer.dispose();
          this.firstChangeDisposerByFileId.delete(file.id);
        });
        this.firstChangeDisposerByFileId.set(file.id, disposer);
      } else {
        if (model.getValue() !== content) {
          model.setValue(content);
        }
        if (!this.firstChangeDisposerByFileId.has(file.id)) {
          const disposer = model.onDidChangeContent(() => {
            if (this.isInitializingFile) {
              this.isInitializingFile = false;
            }
            disposer.dispose();
            this.firstChangeDisposerByFileId.delete(file.id);
          });
          this.firstChangeDisposerByFileId.set(file.id, disposer);
        }
      }

      this.editor.setModel(model);
      (window as any).monaco.editor.setModelLanguage(model, language);

      // Without snapshot, start from 0 unless you return latestRevision in your existing file payload
      if (this.fileRevisionMap[file.id] == null) {
        this.fileRevisionMap[file.id] = 0;
      }

      this.collabService.joinFileSession(this.currentRoomId, file.id, this.userId);

      queueMicrotask(() => {
        this.suspendedLocalEdit = false;
        if (this.isInitializingFile) {
          this.isInitializingFile = false;
        }
      });
    }
  });
}




  // Create new file dialog
  createNewFile() {
    if (!this.newFileName.trim()) {
      return;
    }

    const request = {
      fileName: this.newFileName.trim(),
      content: '',
      language: this.getLanguageFromFileName(this.newFileName),
    };

    this.fileService.createFile(this.currentRoomId, request).subscribe({
      next: (file) => {
        this.files.push(file);
        this.openFile(file);
        this.showCreateFileDialog = false;
        this.newFileName = '';
      },
      error: (error) => {
        console.error('Error creating file:', error);
        alert('Error creating file: ' + error.error.message);
      },
    });
  }

  // Close create file dialog
  closeCreateFileDialog(event: any) {
    if (event.target.classList.contains('modal')) {
      this.showCreateFileDialog = false;
      this.newFileName = '';
    }
  }

  // Save current file
  // saveFile() {
  //   if (!this.currentFile || !this.isFileModified) {
  //     return;
  //   }

  //   const request = {
  //     content: this.currentContent,
  //     language: this.currentFile.language,
  //   };

  //   this.fileService.updateFile(this.currentFile.id, request).subscribe({
  //     next: (updatedFile) => {
  //       this.currentFile = updatedFile;
  //       this.isFileModified = false;
  //       console.log('File saved successfully');
  //     },
  //     error: (error: any) => {
  //       console.error('Error saving file:', error);
  //       alert('Error saving file');
  //     },
  //   });
  // }

  // Delete file
  deleteFile(fileId: number, event: Event) {
    event.stopPropagation();

    if (confirm('Are you sure you want to delete this file?')) {
      this.fileService.deleteFile(fileId).subscribe({
        next: () => {
          this.files = this.files.filter((f) => f.id !== fileId);
          if (this.currentFile?.id === fileId) {
            const idx = this.files.findIndex(f => f.id === fileId);
        // idx is -1 now because we filtered; compute neighbor based on previous position
        // Try next file at same position, else previous one
        const next =
          this.files[Math.min(idx, this.files.length - 1)] ??
          this.files[this.files.length - 1];

        if (next) {
          this.openFile(next);
        } else {
          // No files left
          this.clearCurrentFile();
        }
          }
        },
        error: (error: any) => {
          console.error('Error deleting file:', error);
          alert('Error deleting file');
        },
      });
    }
  }

  // Share room
  shareRoom() {
    const origin = window.location.origin;
    const roomUrl = this.currentRoomId
      ? `${origin}/${this.currentRoomId}`
      : origin;
    navigator.clipboard.writeText(roomUrl).then(() => {
      alert('Room URL copied to clipboard!');
    });
  }

  // Update editor language
  updateEditorLanguage(fileName: string) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    let language = 'plaintext';

    switch (extension) {
      case 'cpp':
      case 'cc':
      case 'cxx':
      case 'c++':
        language = 'cpp';
        break;
      case 'java':
        language = 'java';
        break;
      case 'py':
        language = 'python';
        break;
      case 'js':
      case 'jsx':
        language = 'javascript';
        break;
      case 'html':
      case 'htm':
        language = 'html';
        break;
      case 'css':
        language = 'css';
        break;
    }

    if (this.editor) {
      const model = this.editor.getModel();
      if (model && typeof (window as any).monaco !== 'undefined') {
        (window as any).monaco.editor.setModelLanguage(model, language);
      }
    }
  }

  getLanguageFromFileName(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      cpp: 'cpp',
      cc: 'cpp',
      cxx: 'cpp',
      'c++': 'cpp',
      java: 'java',
      py: 'python',
      js: 'javascript',
      jsx: 'javascript',
      html: 'html',
      htm: 'html',
      css: 'css',
    };
    return languageMap[extension || ''] || 'plaintext';
  }

  // Call this when user clicks "Yes" in dialog
  joinPendingRoom() {
    if (!this.pendingJoinRoomId) return;
    this.userroomService
      .joinRoom(this.pendingJoinRoomId, this.userId)
      .subscribe({
        next: () => {
          this.currentRoomId = this.pendingJoinRoomId!;
          localStorage.setItem('currentRoomId', this.currentRoomId);
          this.showJoinRoomDialog = false;
          this.pendingJoinRoomId = null;
          this.loadUserRooms();
          // this.initializeWorkspace();
        },
        error: (err) => {
          alert('Failed to join room: ' + (err.message || err));
          this.showJoinRoomDialog = false;
          this.pendingJoinRoomId = null;
          this.initializeWorkspace();
        },
      });
  }

  cancelJoinRoom() {
    this.showJoinRoomDialog = false;
    this.pendingJoinRoomId = null;
    this.initializeWorkspace();
  }

  /* ------------------------------------------------------ */

  applyRemoteOp(op: OtOperation) {
    if (!this.editor || !this.currentFile) return;
    const model = this.editor.getModel();
    this.suspendedLocalEdit = true;

    if (op.type === 'insert' && op.value) {
      const pos = model.getPositionAt(op.pos);
      console.log('Applying remote insert at', pos, 'value:', op.value);
      model.applyEdits([
        {
          range: {
            startLineNumber: pos.lineNumber,
            startColumn: pos.column,
            endLineNumber: pos.lineNumber,
            endColumn: pos.column,
          },
          text: op.value,
        },
      ]);
    } else if (op.type === 'delete' && op.length) {
      const start = model.getPositionAt(op.pos);
      const end = model.getPositionAt(op.pos + op.length);
      console.log('Applying remote delete from', start, 'to', end);
      model.applyEdits([
        {
          range: {
            startLineNumber: start.lineNumber,
            startColumn: start.column,
            endLineNumber: end.lineNumber,
            endColumn: end.column,
          },
          text: '',
        },
      ]);
    }
    this.suspendedLocalEdit = false;
  }
}
