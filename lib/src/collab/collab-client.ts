/**
 * @alvinahmad/blueprin-sdk - CollabClient
 *
 * Domain client for real-time collaboration, live cursor synchronization,
 * element locking, team invitations, cloud sessions, thread comments,
 * team chat, version history snapshots, and conflict-free CRDT editing.
 */

import { generateId } from '../utils/index.js';
import { CollabTransport } from './collab-transport.js';
import {
  createOperation,
  applyOperation,
  resolveConflicts,
  mergeClocks,
  happenedBefore,
} from './collab-crdt.js';
import type {
  CollabRoom,
  CollabUser,
  CollabMessage,
  CollabOperation,
  CollabDocumentState,
  CollabTransportConfig,
  CollabTransportEvents,
  CollabRoleName,
  CollabPermissionKey,
  CollabRoleDefinition,
  CollabCollaborator,
  CollabInviteResult,
  InviteCollaboratorOptions,
  CreateCollabSessionOptions,
  CollabSession,
  ValidateCollabSessionResult,
  CollabPresence,
  CollabCursorData,
  CollabComment,
  AddCommentOptions,
  CollabDocumentSnapshot,
  SaveDocumentSnapshotOptions,
  CollabChangeHistoryItem,
  CollabChatMessage,
  SendChatMessagePayload,
} from './types.js';
import { COLLAB_ROLE_DEFINITIONS } from './types.js';

import { VoiceCallClient } from './webrtc/index.js';

export interface CollabClientOptions {
  storage: any;
  events: any;
  baseUrl?: string;
  headers?: Record<string, string>;
}

export class CollabClient {
  private _storage: any;
  private _events: any;
  private _baseUrl: string;
  private _headers: Record<string, string>;
  private _currentRoom: CollabRoom | null = null;
  private _currentUser: CollabUser | null = null;
  private _transport: CollabTransport | null = null;
  private _voice: VoiceCallClient;
  private _vectorClock: Record<string, number> = {};
  private _documentState: CollabDocumentState | null = null;
  private _pendingOperations: CollabOperation[] = [];

  constructor({ storage, events, baseUrl = '', headers = {} }: CollabClientOptions) {
    this._storage = storage;
    this._events = events;
    this._baseUrl = baseUrl;
    this._headers = headers;
    this._voice = new VoiceCallClient({ events: this._events, storage: this._storage });
  }

  /**
   * WebRTC Voice Call and Media Mesh client instance.
   */
  get voice(): VoiceCallClient {
    return this._voice;
  }

  // ─── Room Management ─────────────────────────────────────────────────────

  /**
   * Create a new collaborative session room for a project.
   */
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

  /**
   * Join an active collaborative room.
   */
  async joinRoom(
    roomId: string,
    user: Omit<CollabUser, 'joinedAt' | 'lastActive'>
  ): Promise<CollabRoom> {
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
    this._voice.setUser(user.userId, user.name, user.avatar);

    this._events.emit('blueprin:collab:user:joined', { roomId, user: fullUser });
    return room;
  }

  /**
   * Leave the currently joined collaborative room and release held locks.
   */
  async leaveRoom(roomId: string, userId: string): Promise<boolean> {
    const rooms: CollabRoom[] = (await this._storage.get('collab_rooms')) || [];
    const room = rooms.find((r) => r.roomId === roomId);
    if (!room) return false;

    room.activeUsers = room.activeUsers.filter((u) => u.userId !== userId);
    // Release locks held by this user
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

  /**
   * Get the active room instance if connected.
   */
  getCurrentRoom(): CollabRoom | null {
    return this._currentRoom;
  }

  /**
   * Get the active user profile in the current room.
   */
  getCurrentUser(): CollabUser | null {
    return this._currentUser;
  }

  // ─── Invitations & Collaborator Management ────────────────────────────────

  /**
   * Invite a team member to collaborate on a project via email and assigned role.
   */
  async inviteUser(
    projectId: string,
    email: string,
    role: CollabRoleName = 'viewer',
    projectName: string = ''
  ): Promise<CollabInviteResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return {
        success: false,
        error: `Invalid email address: ${email}`,
      };
    }

    const inviteUrl = this.buildCollabJoinUrl(projectId);

    try {
      if (this._baseUrl) {
        const res = await fetch(`${this._baseUrl}/api/collab/invitations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this._headers,
          },
          body: JSON.stringify({
            projectId,
            email: normalizedEmail,
            role,
            projectName,
          }),
        });

        if (res.ok) {
          const payload = await res.json();
          return {
            success: true,
            data: payload.data || null,
            inviteUrl: payload.inviteUrl || inviteUrl,
            message: payload.message || 'Invitation sent successfully',
          };
        }
      }
    } catch {
      // Fall back to local storage record
    }

    // Local / offline fallback
    const collaborator: CollabCollaborator = {
      id: generateId(),
      projectId,
      userId: generateId(),
      role,
      invitedAt: new Date().toISOString(),
      profile: {
        id: generateId(),
        email: normalizedEmail,
        fullName: normalizedEmail.split('@')[0],
      },
    };

    const list: CollabCollaborator[] =
      (await this._storage.get(`collab_members_${projectId}`)) || [];
    list.push(collaborator);
    await this._storage.set(`collab_members_${projectId}`, list);

    this._events.emit('blueprin:collab:user:invited', {
      projectId,
      collaborator,
      inviteUrl,
    });

    return {
      success: true,
      data: collaborator,
      inviteUrl,
      message: `Invitation generated for ${normalizedEmail}`,
    };
  }

  /**
   * Retrieve the list of active collaborators and their roles for a project.
   */
  async getProjectCollaborators(projectId: string): Promise<CollabCollaborator[]> {
    try {
      if (this._baseUrl) {
        const res = await fetch(
          `${this._baseUrl}/api/collab/collaborators?projectId=${encodeURIComponent(projectId)}`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...this._headers,
            },
          }
        );
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data)) return json.data;
        }
      }
    } catch {}

    return (await this._storage.get(`collab_members_${projectId}`)) || [];
  }

  /**
   * Remove a collaborator from the project team.
   */
  async removeCollaborator(
    collaboratorId: string,
    options: { projectId?: string; currentUserId?: string } = {}
  ): Promise<{ success: boolean }> {
    const { projectId, currentUserId } = options;

    if (projectId) {
      const list: CollabCollaborator[] =
        (await this._storage.get(`collab_members_${projectId}`)) || [];
      const caller = list.find((c) => c.userId === currentUserId);
      const target = list.find((c) => c.id === collaboratorId);

      if (target?.userId === currentUserId) {
        throw new Error('Cannot remove yourself from the project.');
      }
      if (caller && caller.role !== 'owner' && caller.role !== 'project_manager') {
        throw new Error('Only project owners or managers can remove collaborators.');
      }

      const filtered = list.filter((c) => c.id !== collaboratorId);
      await this._storage.set(`collab_members_${projectId}`, filtered);
    }

    try {
      if (this._baseUrl) {
        await fetch(`${this._baseUrl}/api/collab/collaborators`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...this._headers,
          },
          body: JSON.stringify({ collaboratorId, projectId }),
        });
      }
    } catch {}

    this._events.emit('blueprin:collab:collaborator:removed', {
      collaboratorId,
      projectId,
    });

    return { success: true };
  }

  /**
   * Update the permission role of an existing collaborator.
   */
  async updateCollaboratorRole(
    collaboratorId: string,
    role: CollabRoleName,
    projectId?: string
  ): Promise<CollabCollaborator> {
    if (projectId) {
      const list: CollabCollaborator[] =
        (await this._storage.get(`collab_members_${projectId}`)) || [];
      const target = list.find((c) => c.id === collaboratorId);
      if (!target) throw new Error(`Collaborator "${collaboratorId}" not found`);

      target.role = role;
      await this._storage.set(`collab_members_${projectId}`, list);
      this._events.emit('blueprin:collab:role:updated', {
        collaboratorId,
        role,
        projectId,
      });
      return target;
    }

    throw new Error('Project ID required to update collaborator role.');
  }

  /**
   * Build the shareable web link to join a project collaboration session.
   */
  buildCollabJoinUrl(projectId: string, baseUrl?: string): string {
    const origin = (baseUrl || this._baseUrl || 'https://blueprin.io').replace(/\/+$/, '');
    return `${origin}/housing/collab?project=${encodeURIComponent(projectId)}`;
  }

  // ─── Cloud Sessions & API Tokens ───────────────────────────────────────────

  /**
   * Generate an authenticated API session token for automated or web SDK collaboration.
   */
  async createCollabSession(options: CreateCollabSessionOptions): Promise<CollabSession> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = 'bcoll_';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const expiresInHours = options.expiresInHours || 24;
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();

    const session: CollabSession = {
      id: generateId(),
      userId: options.userId,
      projectId: options.projectId,
      apiKeyId: options.apiKeyId,
      sessionToken: token,
      permissions: options.permissions || ['read', 'write'],
      status: 'active',
      expiresAt,
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };

    const sessions: CollabSession[] = (await this._storage.get('collab_api_sessions')) || [];
    sessions.push(session);
    await this._storage.set('collab_api_sessions', sessions);

    this._events.emit('blueprin:collab:session:created', { session });
    return session;
  }

  /**
   * Validate a collaboration session token.
   */
  async validateCollabSession(sessionToken: string): Promise<ValidateCollabSessionResult> {
    const sessions: CollabSession[] = (await this._storage.get('collab_api_sessions')) || [];
    const session = sessions.find((s) => s.sessionToken === sessionToken);

    if (!session || session.status !== 'active') {
      return { valid: false, error: 'Invalid or inactive session token' };
    }

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      session.status = 'expired';
      await this._storage.set('collab_api_sessions', sessions);
      return { valid: false, error: 'Session token has expired' };
    }

    session.lastActivityAt = new Date().toISOString();
    await this._storage.set('collab_api_sessions', sessions);

    return { valid: true, session };
  }

  /**
   * Revoke an active collaboration session.
   */
  async revokeCollabSession(sessionId: string): Promise<void> {
    const sessions: CollabSession[] = (await this._storage.get('collab_api_sessions')) || [];
    const target = sessions.find((s) => s.id === sessionId);
    if (target) {
      target.status = 'revoked';
      await this._storage.set('collab_api_sessions', sessions);
    }
  }

  /**
   * List active sessions for a specific project.
   */
  async listActiveSessions(projectId: string): Promise<CollabSession[]> {
    const sessions: CollabSession[] = (await this._storage.get('collab_api_sessions')) || [];
    const now = Date.now();
    return sessions.filter(
      (s) => s.projectId === projectId && s.status === 'active' && new Date(s.expiresAt).getTime() > now
    );
  }

  // ─── Presence & Live Cursors ───────────────────────────────────────────────

  /**
   * Broadcast cursor position and active drawing sheet coordinates.
   */
  async updateCursor(roomId: string, userId: string, cursor: CollabCursorData): Promise<void> {
    this._events.emit('blueprin:collab:cursor', {
      roomId,
      userId,
      cursor,
      timestamp: new Date().toISOString(),
    });

    if (this._transport?.isConnected && this._currentUser) {
      this._transport.send({
        roomId,
        senderId: userId,
        type: 'cursor',
        payload: cursor,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Update full presence information (cursor, selection, viewport, device).
   */
  async updatePresence(
    sessionId: string,
    userId: string,
    projectId: string,
    presenceData: Partial<CollabPresence>
  ): Promise<CollabPresence> {
    const presence: CollabPresence = {
      sessionId,
      userId,
      projectId,
      cursorPosition: presenceData.cursorPosition,
      selectionState: presenceData.selectionState || [],
      viewport: presenceData.viewport,
      status: presenceData.status || 'online',
      userAgent: presenceData.userAgent,
      lastSeenAt: new Date().toISOString(),
      profile: presenceData.profile,
    };

    const presences: Record<string, CollabPresence> =
      (await this._storage.get(`collab_presence_${projectId}`)) || {};
    presences[`${sessionId}_${userId}`] = presence;
    await this._storage.set(`collab_presence_${projectId}`, presences);

    this._events.emit('blueprin:collab:presence:updated', { presence });
    return presence;
  }

  /**
   * Get active presences for a project (within the last 5 minutes).
   */
  async getProjectPresences(projectId: string): Promise<CollabPresence[]> {
    const presences: Record<string, CollabPresence> =
      (await this._storage.get(`collab_presence_${projectId}`)) || {};
    const threshold = Date.now() - 5 * 60 * 1000;

    return Object.values(presences).filter(
      (p) => p.status !== 'offline' && new Date(p.lastSeenAt).getTime() > threshold
    );
  }

  // ─── Element Locking ─────────────────────────────────────────────────────

  /**
   * Lock an element (drawing node, BOQ row, budget cell) for exclusive editing.
   */
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

    if (this._transport?.isConnected) {
      this._transport.send({
        roomId,
        senderId: userId,
        type: 'lock',
        payload: { elementId },
        timestamp: new Date().toISOString(),
      });
    }

    return true;
  }

  /**
   * Unlock a previously locked element.
   */
  async unlockElement(roomId: string, userId: string, elementId: string): Promise<boolean> {
    const rooms: CollabRoom[] = (await this._storage.get('collab_rooms')) || [];
    const room = rooms.find((r) => r.roomId === roomId);
    if (!room || !room.lockedElements[elementId]) return false;

    if (room.lockedElements[elementId].userId === userId) {
      delete room.lockedElements[elementId];
      await this._storage.set('collab_rooms', rooms);
      this._events.emit('blueprin:collab:element:unlocked', { roomId, userId, elementId });

      if (this._transport?.isConnected) {
        this._transport.send({
          roomId,
          senderId: userId,
          type: 'unlock',
          payload: { elementId },
          timestamp: new Date().toISOString(),
        });
      }

      return true;
    }
    return false;
  }

  /**
   * Check if an element is currently locked.
   */
  isElementLocked(roomId: string, elementId: string): boolean {
    if (!this._currentRoom || this._currentRoom.roomId !== roomId) return false;
    return Boolean(this._currentRoom.lockedElements[elementId]);
  }

  // ─── Commenting & Discussion System ──────────────────────────────────────

  /**
   * Add a review comment or discussion note on a resource (drawing, material, task).
   */
  async addComment(options: AddCommentOptions): Promise<CollabComment> {
    const comment: CollabComment = {
      id: generateId(),
      projectId: options.projectId,
      userId: options.userId,
      resourceType: options.resourceType,
      resourceId: options.resourceId,
      content: options.content,
      parentId: options.parentId,
      isResolved: false,
      createdAt: new Date().toISOString(),
      profile: {
        displayName: this._currentUser?.name || 'Team Member',
        avatarUrl: this._currentUser?.avatar,
      },
    };

    const key = `collab_comments_${options.resourceType}_${options.resourceId}`;
    const list: CollabComment[] = (await this._storage.get(key)) || [];
    list.push(comment);
    await this._storage.set(key, list);

    this._events.emit('blueprin:collab:comment:added', { comment });
    return comment;
  }

  /**
   * Fetch comments attached to a specific resource.
   */
  async getComments(resourceType: string, resourceId: string): Promise<CollabComment[]> {
    const key = `collab_comments_${resourceType}_${resourceId}`;
    return (await this._storage.get(key)) || [];
  }

  /**
   * Mark a comment thread as resolved.
   */
  async resolveComment(
    commentId: string,
    resolvedBy: string,
    resourceType?: string,
    resourceId?: string
  ): Promise<CollabComment | null> {
    if (resourceType && resourceId) {
      const key = `collab_comments_${resourceType}_${resourceId}`;
      const list: CollabComment[] = (await this._storage.get(key)) || [];
      const target = list.find((c) => c.id === commentId);
      if (target) {
        target.isResolved = true;
        target.resolvedBy = resolvedBy;
        target.resolvedAt = new Date().toISOString();
        await this._storage.set(key, list);
        this._events.emit('blueprin:collab:comment:resolved', { comment: target });
        return target;
      }
    }
    return null;
  }

  // ─── Document Snapshots & Version History ────────────────────────────────

  /**
   * Save a point-in-time document snapshot for backup or version comparison.
   */
  async saveDocumentSnapshot(options: SaveDocumentSnapshotOptions): Promise<CollabDocumentSnapshot> {
    const historyKey = `collab_snapshots_${options.projectId}_${options.documentType}`;
    const snapshots: CollabDocumentSnapshot[] = (await this._storage.get(historyKey)) || [];

    const newVersion = snapshots.length + 1;
    const checksum = `v${newVersion}_${Date.now()}`;

    const snapshot: CollabDocumentSnapshot = {
      id: generateId(),
      projectId: options.projectId,
      documentType: options.documentType,
      version: newVersion,
      state: JSON.parse(JSON.stringify(options.state)),
      checksum,
      createdBy: options.createdBy,
      createdAt: new Date().toISOString(),
    };

    snapshots.push(snapshot);
    await this._storage.set(historyKey, snapshots);

    this._events.emit('blueprin:collab:snapshot:saved', { snapshot });
    return snapshot;
  }

  /**
   * Get a document snapshot by version number or latest.
   */
  async getDocumentSnapshot(
    projectId: string,
    documentType: string,
    version?: number
  ): Promise<CollabDocumentSnapshot | null> {
    const historyKey = `collab_snapshots_${projectId}_${documentType}`;
    const snapshots: CollabDocumentSnapshot[] = (await this._storage.get(historyKey)) || [];
    if (snapshots.length === 0) return null;

    if (version !== undefined) {
      return snapshots.find((s) => s.version === version) || null;
    }
    return snapshots[snapshots.length - 1] || null;
  }

  /**
   * Retrieve all snapshots for a project document.
   */
  async getDocumentHistory(
    projectId: string,
    documentType: string,
    limit: number = 50
  ): Promise<CollabDocumentSnapshot[]> {
    const historyKey = `collab_snapshots_${projectId}_${documentType}`;
    const snapshots: CollabDocumentSnapshot[] = (await this._storage.get(historyKey)) || [];
    return snapshots.slice(-limit).reverse();
  }

  /**
   * Retrieve the audit change history for a project.
   */
  async getChangeHistory(
    projectId: string,
    options: { limit?: number; offset?: number; resourceType?: string } = {}
  ): Promise<CollabChangeHistoryItem[]> {
    const key = `collab_history_${projectId}`;
    let items: CollabChangeHistoryItem[] = (await this._storage.get(key)) || [];

    if (options.resourceType) {
      items = items.filter((i) => i.resourceType === options.resourceType);
    }

    const offset = options.offset || 0;
    const limit = options.limit || 50;
    return items.slice(offset, offset + limit);
  }

  // ─── In-App Team Chat ────────────────────────────────────────────────────

  /**
   * Fetch chat messages for a project discussion channel.
   */
  async fetchChatMessages(projectId: string, limit: number = 200): Promise<CollabChatMessage[]> {
    const key = `collab_chat_${projectId}`;
    const msgs: CollabChatMessage[] = (await this._storage.get(key)) || [];
    return msgs.slice(-limit);
  }

  /**
   * Send a team chat message with optional file/photo attachments.
   */
  async sendChatMessage(
    projectId: string,
    payload: SendChatMessagePayload
  ): Promise<CollabChatMessage> {
    const message: CollabChatMessage = {
      id: generateId(),
      projectId,
      userId: payload.userId || this._currentUser?.userId || 'anonymous',
      userName: payload.userName || this._currentUser?.name || 'Team Member',
      role: payload.role || this._currentUser?.role || 'viewer',
      message: payload.message,
      attachments: payload.attachments || null,
      createdAt: new Date().toISOString(),
    };

    const key = `collab_chat_${projectId}`;
    const msgs: CollabChatMessage[] = (await this._storage.get(key)) || [];
    msgs.push(message);
    await this._storage.set(key, msgs.slice(-500));

    this._events.emit('blueprin:collab:chat:message', { message });

    if (this._transport?.isConnected) {
      this._transport.send({
        roomId: this._currentRoom?.roomId || projectId,
        senderId: message.userId,
        type: 'chat',
        payload: message,
        timestamp: message.createdAt,
      });
    }

    return message;
  }

  // ─── Role Verification & Permissions ─────────────────────────────────────

  /**
   * Verify if a role has the specified permission key.
   */
  can(role: CollabRoleName, permission: CollabPermissionKey): boolean {
    const def = COLLAB_ROLE_DEFINITIONS[role];
    if (!def) return false;
    return Boolean(def.permissions[permission]);
  }

  /**
   * Retrieve the complete role definition by role ID.
   */
  getRoleDefinition(role: CollabRoleName): CollabRoleDefinition {
    return COLLAB_ROLE_DEFINITIONS[role] || COLLAB_ROLE_DEFINITIONS.viewer;
  }

  // ─── General Messaging ───────────────────────────────────────────────────

  async broadcastMessage<T>(
    message: Omit<CollabMessage<T>, 'timestamp'>
  ): Promise<CollabMessage<T>> {
    const msg: CollabMessage<T> = {
      ...message,
      timestamp: new Date().toISOString(),
    };
    this._events.emit(`blueprin:collab:${msg.type}`, msg);

    if (this._transport?.isConnected) {
      this._transport.send(msg);
    }

    return msg;
  }

  // ─── WebSocket Transport ─────────────────────────────────────────────────

  connectTransport(config: CollabTransportConfig, callbacks: CollabTransportEvents = {}): void {
    this._transport = new CollabTransport(config, {
      onConnect: () => {
        this._events.emit('blueprin:collab:connected', {});
        callbacks.onConnect?.();
      },
      onDisconnect: (reason) => {
        this._events.emit('blueprin:collab:disconnected', { reason });
        callbacks.onDisconnect?.(reason);
      },
      onMessage: (message) => {
        this._handleTransportMessage(message);
        callbacks.onMessage?.(message);
      },
      onPresence: (users) => {
        this._events.emit('blueprin:collab:presence', { users });
        callbacks.onPresence?.(users);
      },
      onError: (error) => {
        this._events.emit('blueprin:collab:error', { error });
        callbacks.onError?.(error);
      },
      onReconnecting: (attempt) => {
        this._events.emit('blueprin:collab:reconnecting', { attempt });
        callbacks.onReconnecting?.(attempt);
      },
    });

    this._transport.connect();
  }

  disconnectTransport(): void {
    this._transport?.disconnect();
    this._transport = null;
  }

  get isTransportConnected(): boolean {
    return this._transport?.isConnected ?? false;
  }

  private _handleTransportMessage(message: CollabMessage): void {
    if (message.type === 'lock') {
      const { elementId } = message.payload;
      if (this._currentRoom?.lockedElements[elementId]) {
        const existing = this._currentRoom.lockedElements[elementId];
        if (new Date(message.timestamp).getTime() < new Date(existing.lockedAt).getTime()) {
          delete this._currentRoom.lockedElements[elementId];
          this._events.emit('blueprin:collab:lock:conflict', {
            elementId,
            winner: message.senderId,
            loser: this._currentUser?.userId,
          });
        }
      }
    }
  }

  // ─── CRDT Document Editing ──────────────────────────────────────────────

  initDocument(data: Record<string, any>): CollabDocumentState {
    this._documentState = {
      version: 0,
      vectorClock: {},
      data: JSON.parse(JSON.stringify(data)),
      checksum: '',
    };
    return this._documentState;
  }

  getDocumentState(): CollabDocumentState | null {
    return this._documentState;
  }

  applyLocalEdit(
    path: string,
    type: CollabOperation['type'],
    value?: any,
    oldValue?: any
  ): CollabOperation | null {
    if (!this._documentState || !this._currentUser) return null;

    const operation = createOperation(
      this._currentUser.userId,
      this._currentRoom?.roomId || '',
      type,
      path,
      value,
      oldValue,
      this._vectorClock
    );

    this._documentState = applyOperation(this._documentState, operation);
    this._vectorClock = operation.vectorClock;

    if (this._transport?.isConnected) {
      this._transport.send({
        roomId: this._currentRoom?.roomId || '',
        senderId: this._currentUser.userId,
        type: 'operation',
        payload: operation,
        timestamp: new Date().toISOString(),
      });
    } else {
      this._pendingOperations.push(operation);
    }

    this._events.emit('blueprin:collab:document:changed', {
      operation,
      state: this._documentState,
    });

    return operation;
  }

  applyRemoteOperation(operation: CollabOperation): void {
    if (!this._documentState) return;

    if (happenedBefore(operation.vectorClock, this._documentState.vectorClock)) {
      return;
    }

    this._documentState = applyOperation(this._documentState, operation);
    this._vectorClock = mergeClocks(this._vectorClock, operation.vectorClock);

    this._events.emit('blueprin:collab:document:changed', {
      operation,
      state: this._documentState,
      remote: true,
    });
  }

  resolvePendingOperations(): void {
    if (this._pendingOperations.length === 0) return;

    const resolved = resolveConflicts(this._pendingOperations);
    this._pendingOperations = [];

    for (const op of resolved) {
      if (this._documentState) {
        this._documentState = applyOperation(this._documentState, op);
      }
    }
  }

  // ─── Cleanup ─────────────────────────────────────────────────────────────

  destroy(): void {
    this.disconnectTransport();
    this._currentRoom = null;
    this._currentUser = null;
    this._documentState = null;
    this._pendingOperations = [];
    this._vectorClock = {};
  }
}
