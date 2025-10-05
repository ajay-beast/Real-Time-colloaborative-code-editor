import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileService } from '../services/file.service';
import { RoomService } from '../services/room.service';


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
  
  constructor(
    private fileService: FileService,
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  ngOnInit() {
  this.initializeWorkspace();
  }

    // Initialize workspace - create room if needed, then load files
    initializeWorkspace() {
      this.isLoading = true;
      
      // get room id from local storage
      this.currentRoomId = localStorage.getItem('currentRoomId') || '';
      console.log('Current room ID from local storage:', this.currentRoomId);

      // First check if room exists
      this.roomService.roomExists(this.currentRoomId).subscribe({
        next: (exists) => {
          if (exists) {
            // Room exists, load it and files
            this.loadRoom();
          } else {
            // Room doesn't exist, create it
            this.createRoom();
          }
        },
        error: (error) => {
          console.error('Error checking room:', error);
          // If check fails, try to create room anyway
          this.createRoom();
        }
      });
    }
    
    // Create a new room
    createRoom() {
      const createRoomRequest = {
        roomName: 'My Coding Workspace',
        creatorId: 'user-' + Date.now() // Simple user ID for now
      };
      
      this.roomService.createRoom(createRoomRequest.roomName, createRoomRequest.creatorId).subscribe({
        next: (room) => {
          this.currentRoom = room;
          this.currentRoomId = room.roomId; // Use the generated room ID
          console.log('Room created successfully:', room);
          this.loadFiles();
          localStorage.setItem('currentRoomId', this.currentRoomId);
        },
        error: (error) => {
          console.error('Error creating room:', error);
          // If room creation fails, still try to load files with hardcoded ID
          this.currentRoom = { roomName: 'Default Workspace', roomId: this.currentRoomId };
          this.loadFiles();
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
          this.createRoom();
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
    const roomUrl = window.location.href;
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
}
