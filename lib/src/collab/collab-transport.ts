/**
 * @alvinahmad/blueprin-sdk - Collab Transport
 *
 * WebSocket transport layer for real-time collaboration.
 * Handles connection management, reconnection, heartbeat, and message serialization.
 */

import type { CollabMessage, CollabTransportConfig, CollabTransportEvents } from './types.js';

export class CollabTransport {
  private _config: CollabTransportConfig;
  private _events: CollabTransportEvents;
  private _ws: WebSocket | null = null;
  private _reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private _reconnectAttempts = 0;
  private _isConnected = false;
  private _messageQueue: CollabMessage[] = [];

  constructor(config: CollabTransportConfig, events: CollabTransportEvents = {}) {
    this._config = {
      reconnectIntervalMs: 3000,
      maxReconnectAttempts: 10,
      heartbeatIntervalMs: 30000,
      ...config,
    };
    this._events = events;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): void {
    if (this._ws) {
      this._ws.close();
    }

    try {
      const url = new URL(this._config.url);
      if (typeof window !== 'undefined' && url.protocol !== 'wss:' && url.hostname !== 'localhost') {
        throw new Error('Browser collaboration transports must use wss://, except for localhost development.');
      }
      url.searchParams.set('token', this._config.token);

      this._ws = new WebSocket(url.toString());

      this._ws.onopen = () => {
        this._isConnected = true;
        this._reconnectAttempts = 0;
        this._startHeartbeat();
        this._flushQueue();
        this._events.onConnect?.();
      };

      this._ws.onclose = (event) => {
        this._isConnected = false;
        this._stopHeartbeat();
        this._events.onDisconnect?.(event.reason || 'connection closed');

        if (!event.wasClean) {
          this._scheduleReconnect();
        }
      };

      this._ws.onerror = (event) => {
        this._events.onError?.(new Error('WebSocket error'));
      };

      this._ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as CollabMessage;
          this._events.onMessage?.(message);
        } catch {
          // Ignore malformed messages
        }
      };
    } catch (err) {
      this._events.onError?.(err as Error);
      this._scheduleReconnect();
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this._stopHeartbeat();
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer);
      this._reconnectTimer = null;
    }
    this._reconnectAttempts = this._config.maxReconnectAttempts!;
    if (this._ws) {
      this._ws.close(1000, 'client disconnect');
      this._ws = null;
    }
    this._isConnected = false;
  }

  /**
   * Send a message to the server
   */
  send(message: CollabMessage): void {
    if (!this._isConnected || !this._ws) {
      this._messageQueue.push(message);
      return;
    }

    try {
      this._ws.send(JSON.stringify(message));
    } catch {
      this._messageQueue.push(message);
    }
  }

  /**
   * Send a message and wait for acknowledgment
   */
  sendAndWait(message: CollabMessage, timeoutMs = 5000): Promise<CollabMessage> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Message ack timeout'));
      }, timeoutMs);

      const originalOnMessage = this._events.onMessage;
      this._events.onMessage = (msg) => {
        if (msg.type === message.type && msg.senderId === message.senderId) {
          clearTimeout(timer);
          this._events.onMessage = originalOnMessage;
          resolve(msg);
        }
        originalOnMessage?.(msg);
      };

      this.send(message);
    });
  }

  private _flushQueue(): void {
    while (this._messageQueue.length > 0) {
      const msg = this._messageQueue.shift()!;
      this.send(msg);
    }
  }

  private _scheduleReconnect(): void {
    if (this._reconnectAttempts >= this._config.maxReconnectAttempts!) {
      this._events.onError?.(new Error('Max reconnect attempts reached'));
      return;
    }

    this._reconnectAttempts++;
    this._events.onReconnecting?.(this._reconnectAttempts);

    const delay = this._config.reconnectIntervalMs! * Math.min(this._reconnectAttempts, 5);
    this._reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private _startHeartbeat(): void {
    this._stopHeartbeat();
    this._heartbeatTimer = setInterval(() => {
      if (this._isConnected && this._ws) {
        this._ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
      }
    }, this._config.heartbeatIntervalMs);
  }

  private _stopHeartbeat(): void {
    if (this._heartbeatTimer) {
      clearInterval(this._heartbeatTimer);
      this._heartbeatTimer = null;
    }
  }
}
