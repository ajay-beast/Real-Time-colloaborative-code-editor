import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private baseUrl = 'http://localhost:8080/api/files';
  
  constructor(private http: HttpClient) {}
  
  getFilesByRoom(roomId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/room/${roomId}`);
  }
  
  createFile(roomId: string, request: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/room/${roomId}`, request);
  }
  
  updateFile(fileId: number, request: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${fileId}`, request);
  }

  deleteFile(fileId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${fileId}`);
  }

  getSnapshot(roomId: string, fileId: number) {
  return this.http.get<{ roomId: string; fileId: number; content: string; revision: number }>(
    `http://localhost:8080/api/collab/rooms/${roomId}/files/${fileId}/snapshot`
  );
}
  
  private getLanguageFromFileName(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      // C++
      'cpp': 'cpp',
      'cc': 'cpp',
      'cxx': 'cpp',
      'c++': 'cpp',
      
      // Java
      'java': 'java',
      
      // Python
      'py': 'python',
      
      // JavaScript
      'js': 'javascript',
      'jsx': 'javascript',
      
      // HTML
      'html': 'html',
      'htm': 'html',
      
      // CSS
      'css': 'css'
    };
    
    return languageMap[extension || ''] || 'plaintext';
  }
}
