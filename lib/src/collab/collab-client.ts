/**
 * @alvinahmad/blueprin-sdk - CollabClient
 *
 * Domain client for real-time collaboration, cursor tracking, and element locking.
 */

import { generateId } from '../utils/index.js';
import type { CollabRoom, CollabUser, CollabMessage } from './types.js';

export class CollabClient {
  private _storage: any;
  private _events: any;
  private _currentRoom: CollabRoom | null = null;
  private _currentUser: CollabUser | null = null;

  constructor({ storage, events }: { storage: any; events: any }) {
    this._storage = storage;
    this._events = events;
  }

  async createRoom(projectId: string, name: string): Promise<CollabRoom> {
    const room: CollabRoom = {
      roomId: generateId(),
      projectId,
      name,
      activeUsers: [],
      lockedElements: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const rooms: CollabRoom[] = (await this._storage.get('collab_rooms')) || [];
    rooms.push(room);
    await this._storage.set('collab_rooms', rooms);

    this._events.emit('blueprin:collab:room:created', { room });
    return room;
  }

  async joinRoom(roomId: string, user: Omit<CollabUser, 'joinedAt' | 'lastActive'>): Promise<CollabRoom> {
    const rooms: CollabRoom[] = (await this._storage.get('collab_rooms')) || [];
    const room = rooms.find((r) => r.roomId === roomId);
    if (!room) throw new Error(`Collab Room "${roomId}" not found`);

    const fullUser: CollabUser = {
      ...user,
      joinedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    room.activeUsers = room.activeUsers.filter((u) => u.userId !== user.userId);
    room.activeUsers.push(fullUser);
    room.updatedAt = new Date().toISOString();

    await this._storage.set('collab_rooms', rooms);
    this._currentRoom = room;
    this._currentUser = fullUser;

    this._events.emit('blueprin:collab:user:joined', { roomId, user: fullUser });
    return room;
  }

  async leaveRoom(roomId: string, userId: string): Promise<boolean> {
    const rooms: CollabRoom[] = (await this._storage.get('collab_rooms')) || [];
    const room = rooms.find((r) => r.roomId === roomId);
    if (!room) return false;

    room.activeUsers = room.activeUsers.filter((u) => u.userId !== userId);
    // Release locks
    for (const [elId, lock] of Object.entries(room.lockedElements)) {
      if (lock.userId === userId) {
        delete room.lockedElements[elId];
      }
    }
    room.updatedAt = new Date().toISOString();

    await this._storage.set('collab_rooms', rooms);
    if (this._currentRoom?.roomId === roomId) {
      this._currentRoom = null;
      this._currentUser = null;
    }

    this._events.emit('blueprin:collab:user:left', { roomId, userId });
    return true;
  }

  async updateCursor(roomId: string, userId: string, cursor: { x: number; y: number; sheetId?: string }): Promise<void> {
    this._events.emit('blueprin:collab:cursor', { roomId, userId, cursor, timestamp: new Date().toISOString() });
  }

  async lockElement(roomId: string, userId: string, elementId: string): Promise<boolean> {
    const rooms: CollabRoom[] = (await this._storage.get('collab_rooms')) || [];
    const room = rooms.find((r) => r.roomId === roomId);
    if (!room) return false;

    if (room.lockedElements[elementId] && room.lockedElements[elementId].userId !== userId) {
      return false; // Already locked by another user
    }

    room.lockedElements[elementId] = {
      userId,
      lockedAt: new Date().toISOString(),
    };

    await this._storage.set('collab_rooms', rooms);
    this._events.emit('blueprin:collab:element:locked', { roomId, userId, elementId });
    return true;
  }

  async unlockElement(roomId: string, userId: string, elementId: string): Promise<boolean> {
    const rooms: CollabRoom[] = (await this._storage.get('collab_rooms')) || [];
    const room = rooms.find((r) => r.roomId === roomId);
    if (!room || !room.lockedElements[elementId]) return false;

    if (room.lockedElements[elementId].userId === userId) {
      delete room.lockedElements[elementId];
      await this._storage.set('collab_rooms', rooms);
      this._events.emit('blueprin:collab:element:unlocked', { roomId, userId, elementId });
      return true;
    }
    return false;
  }

  async broadcastMessage<T>(message: Omit<CollabMessage<T>, 'timestamp'>): Promise<CollabMessage<T>> {
    const msg: CollabMessage<T> = {
      ...message,
      timestamp: new Date().toISOString(),
    };
    this._events.emit(`blueprin:collab:${msg.type}`, msg);
    return msg;
  }
}
