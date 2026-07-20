import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE_URL } from './api';

// Mirrors backend AlertBroadcaster.java destinations:
//   /topic/incidents               -> incident create/update
//   /topic/agent-pipeline/{id}     -> per-incident agent step stream
//   /topic/alerts                  -> citizen/gov alert broadcasts
export type ConnectionState = 'connecting' | 'connected' | 'disconnected';

class RescueSocket {
  private client: Client | null = null;
  private listeners = new Set<(state: ConnectionState) => void>();
  state: ConnectionState = 'disconnected';

  connect() {
    if (this.client?.active) return;
    this.setState('connecting');
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`) as unknown as WebSocket,
      reconnectDelay: 4000,
      onConnect: () => this.setState('connected'),
      onDisconnect: () => this.setState('disconnected'),
      onWebSocketClose: () => this.setState('disconnected'),
      onStompError: () => this.setState('disconnected'),
    });
    this.client.activate();
  }

  disconnect() {
    this.client?.deactivate();
    this.setState('disconnected');
  }

  subscribe(topic: string, cb: (msg: IMessage) => void) {
    if (!this.client || !this.client.active) return () => {};
    const sub = this.client.subscribe(topic, cb);
    return () => sub.unsubscribe();
  }

  onStateChange(cb: (state: ConnectionState) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private setState(s: ConnectionState) {
    this.state = s;
    this.listeners.forEach((cb) => cb(s));
  }
}

export const rescueSocket = new RescueSocket();
