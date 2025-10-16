import { Job } from '../types/job';

type JobUpdateCallback = (job: Job) => void;

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

class WebSocketManager {
  private ws: WebSocket | null = null;
  private callbacks: Set<JobUpdateCallback> = new Set();
  private reconnectTimeout: number | null = null;
  private eventListener: ((event: Event) => void) | null = null;
  private readonly WS_URL = import.meta.env.VITE_WS_URL ||
    (window.location.protocol === 'https:' ? 'wss://' : 'ws://') +
    window.location.host + '/ws';

  connect() {
    // If using mock mode, listen to custom events instead of WebSocket
    if (USE_MOCK || !this.WS_URL || this.WS_URL === window.location.host + '/ws') {
      console.log('Using mock WebSocket (custom events)');
      this.setupMockConnection();
      return;
    }

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

      this.ws.onerror = () => {
        console.warn('WebSocket error, falling back to mock mode');
        this.setupMockConnection();
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected, using mock mode');
        this.setupMockConnection();
      };
    } catch (error) {
      console.warn('Failed to create WebSocket connection, using mock mode');
      this.setupMockConnection();
    }
  }

  private setupMockConnection() {
    if (this.eventListener) {
      return; // Already set up
    }

    this.eventListener = ((event: CustomEvent<Job>) => {
      this.callbacks.forEach((callback) => callback(event.detail));
    }) as EventListener;

    window.addEventListener('jobUpdate', this.eventListener);
  }

  // Removed - not currently used in mock mode
  // private scheduleReconnect() {
  //   if (this.reconnectTimeout) {
  //     return;
  //   }
  //   this.reconnectTimeout = window.setTimeout(() => {
  //     console.log('Attempting to reconnect WebSocket...');
  //     this.connect();
  //   }, 3000);
  // }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.eventListener) {
      window.removeEventListener('jobUpdate', this.eventListener);
      this.eventListener = null;
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
