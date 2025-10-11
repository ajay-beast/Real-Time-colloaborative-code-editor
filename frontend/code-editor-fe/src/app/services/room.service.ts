import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private baseUrl = 'http://localhost:8080/api/rooms';
  
  constructor(private http: HttpClient) {}
  
  createRoom(roomName: string, creatorId: string): Observable<any> {
    return this.http.post<any>(this.baseUrl, {
      roomName,
      creatorId
    });
  }
  
  getRoom(roomId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${roomId}`);
  }
  
  roomExists(roomId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/${roomId}/exists`);
  }
}
