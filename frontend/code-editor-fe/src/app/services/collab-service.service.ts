import { Injectable } from '@angular/core';
import * as SockJS from 'sockjs-client';
import { Client, IMessage, Stomp } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';

export interface OtOperation {
  type: 'insert' | 'delete';
  pos: number;
  value?: string;
  length?: number;
  clientId: string;
  baseRevision: number; 
  fileId: number;
  roomId: string;
}

@Injectable({
  providedIn: 'root'
})
export class CollabServiceService {

  private stompClient: Client | null = null;
  private operationsSubject = new Subject<{roomId: string, op: OtOperation}>();
  private connectionSubject = new Subject<void>();
  onConnected$ = this.connectionSubject.asObservable();


  connect(wsUrl: string): void {
    const socket = new SockJS(wsUrl);
    this.stompClient = Stomp.over(() => socket);

    this.stompClient.debug = () => {}; // Disable console logging

    this.stompClient.activate();

    this.stompClient.onConnect = () => {
      console.log('Connected to WebSocket server');
      this.stompClient?.subscribe('/topic/room.*', (message: IMessage) => {
        console.log("Raw message body:", message.body);
        const op = JSON.parse(message.body) as OtOperation;
        console.log("Parsed op:", op);
        const destination = message.headers['destination'] as string;
        const roomId : string = destination.split('.').pop() ?? '';
        this.operationsSubject.next({roomId, op});
      });
      this.connectionSubject.next();
    };

    this.stompClient.onStompError = frame => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };
  }

  joinFileSession(roomId: string, fileId: number, userId: string): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('WebSocket not connected yet');
      return;
    }
    this.stompClient.publish({
      destination: '/app/join',
      body: JSON.stringify({ roomId, fileId, userId })
    });
  }

  sendOp(op: OtOperation): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('WebSocket not connected yet');
      return;
    }
    this.stompClient.publish({
      destination: '/app/operation',
      body: JSON.stringify({ roomId: op.roomId, op })
    });
  }

  onRemoteOp(): Observable<{roomId: string, op: OtOperation}> {
    return this.operationsSubject.asObservable();
  }
}
