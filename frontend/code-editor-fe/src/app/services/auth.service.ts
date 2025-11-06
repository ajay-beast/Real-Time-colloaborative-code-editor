import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, tap, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'jwt';
  private userKey = 'user';
  private auth$ = new BehaviorSubject<boolean>(!!localStorage.getItem(this.tokenKey));
  private baseUrl =   "http://localhost:8080/api/auth";

  constructor(private http: HttpClient) {}

  signup(data: { username: string; password: string; displayName?: string }) {
    return this.http.post<AuthResponse>(this.baseUrl + '/signup', data).pipe(
      tap(res => this.store(res))
    );
  }

  signin(data: { username: string; password: string }) {
    return this.http.post<AuthResponse>(this.baseUrl + '/signin', data).pipe(
      tap(res => this.store(res))
    );
  }

  private store(res: AuthResponse) {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem(this.userKey, JSON.stringify({ username: res.username, displayName: res.displayName }));
    this.auth$.next(true);
    localStorage.setItem('login', String(Date.now()));
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.setItem('logout', String(Date.now()));
    this.auth$.next(false);
  }

  get token(): string | null { return localStorage.getItem(this.tokenKey); }
  get isAuthenticated$(): Observable<boolean> { return this.auth$.asObservable(); }
  get currentUser() { const s = localStorage.getItem(this.userKey); return s ? JSON.parse(s) : null; }
}

export interface AuthResponse {
  token: string;
  username: string;
  displayName?: string;
}
