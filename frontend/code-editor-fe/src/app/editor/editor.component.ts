import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileService } from '../services/file.service';
import { RoomService } from '../services/room.service';
import { UserroomService } from '../services/userroom.service';


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
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
    formatOnPaste: true
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
  
  constructor(
    private fileService: FileService,
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router,
    private userroomService: UserroomService
  ) {}
  
  ngOnInit() {
//     this.loadUserRooms();
//     // If roomId is present in URL, use it and persist
//     const roomIdFromRoute = this.route.snapshot.paramMap.get('roomId');
//     console.log('Room ID from route:', roomIdFromRoute);
//     if (roomIdFromRoute && roomIdFromRoute.trim()) {
//           // Check if user is already in this room 
//           console.log('Comparing roomIdFromRoute:', roomIdFromRoute, typeof roomIdFromRoute);
// console.log('UserRooms room IDs:', this.userRooms.map(r => [r.room.roomId, typeof r.room.roomId]));

//       const alreadyInRoom = this.userRooms.some(r => r.room.roomId === roomIdFromRoute);
//       console.log('Is user already in room?', alreadyInRoom);
//       if (!alreadyInRoom) {
//         this.showJoinRoomDialog = true;
//         this.pendingJoinRoomId = roomIdFromRoute;
//         return; // Wait for user action
//       }
//       else{      
//       this.currentRoomId = roomIdFromRoute.trim();
//       localStorage.setItem('currentRoomId', this.currentRoomId);
//       }
//     }
//     this.initializeWorkspace();
    this.loadUserRooms();
  }

  loadUserRooms() {
    // this.userroomService.getUserRooms(this.userId).subscribe({
    //   next: (userrooms) => {
    //     this.userRooms = userrooms;
    //    console.log('Loaded user rooms:', this.userRooms);

    //     // If no roomId set, but rooms exist, set first as active
    //     if (!this.currentRoomId && userrooms.length > 0) {
    //       this.switchRoom(userrooms[0].room);
    //     }
    //   },
    //   error: (e) => console.error('Failed to load user rooms', e)
    // });
     this.userroomService.getUserRooms(this.userId).subscribe({
    next: (userrooms) => {
      this.userRooms = userrooms;
      console.log('Loaded user rooms:', this.userRooms);

      const roomIdFromRoute = this.route.snapshot.paramMap.get('roomId');
      console.log('Room ID from route:', roomIdFromRoute);

      if (roomIdFromRoute && roomIdFromRoute.trim()) {
        const alreadyInRoom = this.userRooms.some(
          r => r.room?.roomId?.trim() === roomIdFromRoute.trim()
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
      }

      // Continue workspace setup
      this.initializeWorkspace();
    },
    error: (e) => {
      console.error('Failed to load user rooms', e);
      this.initializeWorkspace(); // fallback init
    }
  });
  }

  switchRoom(room: any) {
    if (this.currentRoomId === room.roomId) return;
    if (this.isFileModified) {
      if (!confirm('You have unsaved changes. Continue without saving?')) return;
    }
    
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
      alert("Creators cannot leave their own rooms.");
      return;
    }
    if (confirm(`Leave room "${userroom.room.roomName}"?`)) {
      this.userroomService.leaveRoom(userroom.room.roomId, this.userId).subscribe({
        next: () => {
          this.userRooms = this.userRooms.filter(r => r.room.roomId !== userroom.room.roomId);
          if (this.currentRoomId === userroom.room.roomId) {
            // Switch to another room or clear
            if(this.userRooms.length > 0) {
              this.switchRoom(this.userRooms[0].room);
            }
            else {
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
    const proceed = confirm('Create a new room? Your current unsaved changes will be lost.');
    if (!proceed) { return; }

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

      if(!this.currentRoomId){
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
           if(!this.currentRoomId) {
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
        }
      });
    }
    
    // Create a new room (optionally using a provided room name)
    createRoom(roomName?: string) {
      const createRoomRequest = {
        roomName: (roomName && roomName.trim()) ? roomName.trim() : 'My Coding Workspace',
        creatorId: this.userId // Simple user ID for now
      };
      
      this.roomService.createRoom(createRoomRequest.roomName, createRoomRequest.creatorId).subscribe({
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
        }
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
        }
      });
    }
    
    // Load files for current room
    loadFiles() {
      this.fileService.getFilesByRoom(this.currentRoomId).subscribe({
        next: (files) => {
          this.files = files;
          console.log('Files loaded:', files.length);
          
          // Open first file if available
          if (files.length > 0 && !this.currentFile) {
            this.openFile(files[0]);
          }
          
          this.isLoading = false; // Hide loading state
        },
        error: (error) => {
          console.error('Error loading files:', error);
          // Even if file loading fails, show the editor
          this.files = [];
        this.currentFile = null;
         this.currentContent = '';
        this.isFileModified = false;
        this.isLoading = false;
        }
      });
    }
  
  // Monaco editor initialization
  onEditorInit(editor: any) {
    this.editor = editor;
    console.log('Monaco Editor initialized');
    // Listen for content changes
    editor.onDidChangeModelContent(() => {
      if (this.currentFile) {
        this.isFileModified = true;
      }
    });
  }
  
  // Handle content changes
  onContentChange(content: string) {
    if (this.currentFile && content !== this.currentFile.content) {
      this.isFileModified = true;
    }
  }
  
  // Open a file
  openFile(file: any) {
    // Save current file if modified
    if (this.isFileModified) {
      this.saveFile();
    }
    
    this.currentFile = file;
    this.currentContent = file.content;
    this.isFileModified = false;
    this.updateEditorLanguage(file.fileName);
  }
  
  // Create new file dialog
  createNewFile() {
    if (!this.newFileName.trim()) {
      return;
    }
    
    const request = {
      fileName: this.newFileName.trim(),
      content: '',
      language: this.getLanguageFromFileName(this.newFileName)
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
      }
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
  saveFile() {
    if (!this.currentFile || !this.isFileModified) {
      return;
    }
    
    const request = {
      content: this.currentContent,
      language: this.currentFile.language
    };
    
    this.fileService.updateFile(this.currentFile.id, request).subscribe({
      next: (updatedFile) => {
        this.currentFile = updatedFile;
        this.isFileModified = false;
        console.log('File saved successfully');
      },
      error: (error: any) => {
        console.error('Error saving file:', error);
        alert('Error saving file');
      }
    });
  }
  
  // Delete file
  deleteFile(fileId: number, event: Event) {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this file?')) {
      this.fileService.deleteFile(fileId).subscribe({
        next: () => {
          this.files = this.files.filter(f => f.id !== fileId);
          if (this.currentFile?.id === fileId) {
            this.currentFile = null;
            this.currentContent = '';
            this.isFileModified = false;
          }
        },
        error: (error: any) => {
          console.error('Error deleting file:', error);
          alert('Error deleting file');
        }
      });
    }
  }
  
  // Share room
  shareRoom() {
    const origin = window.location.origin;
    const roomUrl = this.currentRoomId ? `${origin}/${this.currentRoomId}` : origin;
    navigator.clipboard.writeText(roomUrl).then(() => {
      alert('Room URL copied to clipboard!');
    });
  }

  
  // Update editor language
  updateEditorLanguage(fileName: string) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    let language = 'plaintext';
    
    switch(extension) {
      case 'cpp': case 'cc': case 'cxx': case 'c++': 
        language = 'cpp'; break;
      case 'java': 
        language = 'java'; break;
      case 'py': 
        language = 'python'; break;
      case 'js': case 'jsx': 
        language = 'javascript'; break;
      case 'html': case 'htm': 
        language = 'html'; break;
      case 'css': 
        language = 'css'; break;
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
      'cpp': 'cpp', 'cc': 'cpp', 'cxx': 'cpp', 'c++': 'cpp',
      'java': 'java',
      'py': 'python',
      'js': 'javascript', 'jsx': 'javascript',
      'html': 'html', 'htm': 'html',
      'css': 'css'
    };
    return languageMap[extension || ''] || 'plaintext';
  }

    // Call this when user clicks "Yes" in dialog
  joinPendingRoom() {
    if (!this.pendingJoinRoomId) return;
    this.userroomService.joinRoom(this.pendingJoinRoomId, this.userId).subscribe({
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
      }
    });
  }

   cancelJoinRoom() {
    this.showJoinRoomDialog = false;
    this.pendingJoinRoomId = null;
    this.initializeWorkspace();
  }
}
