import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserroomService {

   private baseUrl = 'http://localhost:8080/api/userrooms';

  constructor(private http: HttpClient) { }

    getUserRooms(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/user/${userId}`);
  }
  
  leaveRoom(roomId: string, userId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${roomId}/leave`, { userId });
  }

  joinRoom(roomId: string, userId: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${roomId}/join`, { userId });
  } 
}
