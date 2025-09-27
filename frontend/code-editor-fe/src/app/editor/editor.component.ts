import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  constructor() { }

  editorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    fontSize: 14,
    automaticLayout: true
  };
  
  currentContent = '';
  currentFile: any = null;
  files: any[] = [];
  editor: any;

  ngOnInit(): void {
    this.loadFiles();
  }

  onEditorInit(editor: any) {
    this.editor = editor;
    console.log('Monaco Editor initialized');
  }
  
  loadFiles() {
    // TODO: Load files from backend
  }
  
  openFile(file: any) {
    this.currentFile = file;
    this.currentContent = file.content;
    // Update language based on file extension
    this.updateEditorLanguage(file.fileName);
  }
  
  createNewFile() {
    // TODO: Create new file dialog
  }
  
  updateEditorLanguage(fileName: string) {
    const extension = fileName.split('.').pop();
    let language = 'plaintext';
    
    switch(extension) {
      case 'js': language = 'javascript'; break;
      case 'java': language = 'java'; break;
      case 'py': language = 'python'; break;
      case 'html': language = 'html'; break;
      case 'css': language = 'css'; break;
    }
    
    if (this.editor) {
      const model = this.editor.getModel();
      if (window && (window as any).monaco) {
        (window as any).monaco.editor.setModelLanguage(model, language);
      } else {
        console.warn('Monaco editor is not available on the window object.');
      }
    }
  }
}
