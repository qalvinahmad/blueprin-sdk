/**
 * @alvinahmad/blueprin-sdk - Real-time Collaboration Types
 */

export interface CollabUser {
  userId: string;
  name: string;
  avatar?: string;
  color: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: string;
  lastActive: string;
  cursor?: {
    x: number;
    y: number;
    sheetId?: string;
  };
  selection?: string[];
}

export interface CollabRoom {
  roomId: string;
  projectId: string;
  name: string;
  activeUsers: CollabUser[];
  lockedElements: Record<string, { userId: string; lockedAt: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface CollabMessage<T = any> {
  roomId: string;
  senderId: string;
  type: 'presence' | 'cursor' | 'selection' | 'patch' | 'lock' | 'unlock' | 'chat';
  payload: T;
  timestamp: string;
}
