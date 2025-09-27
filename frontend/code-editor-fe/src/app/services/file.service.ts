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
  
  createFile(roomId: string, fileName: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/room/${roomId}`, {
      fileName,
      content: '',
      language: this.getLanguageFromFileName(fileName)
    });
  }
  
  updateFile(fileId: number, content: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${fileId}`, {
      content
    });
  }
  
  private getLanguageFromFileName(fileName: string): string {
    const extension = fileName.split('.').pop();
    const languageMap: any = {
      'js': 'javascript',
      'java': 'java',
      'py': 'python',
      'html': 'html',
      'css': 'css'
    };
    return languageMap[extension || ''] || 'plaintext';
  }
}
