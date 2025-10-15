import { Job } from '../types/job';

type JobUpdateCallback = (job: Job) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private callbacks: Set<JobUpdateCallback> = new Set();
  private reconnectTimeout: number | null = null;
  private readonly WS_URL = import.meta.env.VITE_WS_URL ||
    (window.location.protocol === 'https:' ? 'wss://' : 'ws://') +
    window.location.host + '/ws';

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(this.WS_URL);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const job: Job = JSON.parse(event.data);
          this.callbacks.forEach((callback) => callback(job));
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      return;
    }
    this.reconnectTimeout = window.setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      this.connect();
    }, 3000);
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe(callback: JobUpdateCallback) {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }
}

export const wsManager = new WebSocketManager();
