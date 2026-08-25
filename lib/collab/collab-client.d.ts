/**
 * @alvinahmad/blueprin-sdk - CollabClient
 *
 * Domain client for real-time collaboration, live cursor synchronization,
 * element locking, team invitations, cloud sessions, thread comments,
 * team chat, version history snapshots, and conflict-free CRDT editing.
 */
import type { CollabRoom, CollabUser, CollabMessage, CollabOperation, CollabDocumentState, CollabTransportConfig, CollabTransportEvents, CollabRoleName, CollabPermissionKey, CollabRoleDefinition, CollabCollaborator, CollabInviteResult, CreateCollabSessionOptions, CollabSession, ValidateCollabSessionResult, CollabPresence, CollabCursorData, CollabComment, AddCommentOptions, CollabDocumentSnapshot, SaveDocumentSnapshotOptions, CollabChangeHistoryItem, CollabChatMessage, SendChatMessagePayload } from './types.js';
import { VoiceCallClient } from './webrtc/index.js';
export interface CollabClientOptions {
    storage: any;
    events: any;
    baseUrl?: string;
    headers?: Record<string, string>;
}
export declare class CollabClient {
    private _storage;
    private _events;
    private _baseUrl;
    private _headers;
    private _currentRoom;
    private _currentUser;
    private _transport;
    private _voice;
    private _vectorClock;
    private _documentState;
    private _pendingOperations;
    constructor({ storage, events, baseUrl, headers }: CollabClientOptions);
    /**
     * WebRTC Voice Call and Media Mesh client instance.
     */
    get voice(): VoiceCallClient;
    /**
     * Create a new collaborative session room for a project.
     */
    createRoom(projectId: string, name: string): Promise<CollabRoom>;
    /**
     * Join an active collaborative room.
     */
    joinRoom(roomId: string, user: Omit<CollabUser, 'joinedAt' | 'lastActive'>): Promise<CollabRoom>;
    /**
     * Leave the currently joined collaborative room and release held locks.
     */
    leaveRoom(roomId: string, userId: string): Promise<boolean>;
    /**
     * Get the active room instance if connected.
     */
    getCurrentRoom(): CollabRoom | null;
    /**
     * Get the active user profile in the current room.
     */
    getCurrentUser(): CollabUser | null;
    /**
     * Invite a team member to collaborate on a project via email and assigned role.
     */
    inviteUser(projectId: string, email: string, role?: CollabRoleName, projectName?: string): Promise<CollabInviteResult>;
    /**
     * Retrieve the list of active collaborators and their roles for a project.
     */
    getProjectCollaborators(projectId: string): Promise<CollabCollaborator[]>;
    /**
     * Remove a collaborator from the project team.
     */
    removeCollaborator(collaboratorId: string, options?: {
        projectId?: string;
        currentUserId?: string;
    }): Promise<{
        success: boolean;
    }>;
    /**
     * Update the permission role of an existing collaborator.
     */
    updateCollaboratorRole(collaboratorId: string, role: CollabRoleName, projectId?: string): Promise<CollabCollaborator>;
    /**
     * Build the shareable web link to join a project collaboration session.
     */
    buildCollabJoinUrl(projectId: string, baseUrl?: string): string;
    /**
     * Generate an authenticated API session token for automated or web SDK collaboration.
     */
    createCollabSession(options: CreateCollabSessionOptions): Promise<CollabSession>;
    /**
     * Validate a collaboration session token.
     */
    validateCollabSession(sessionToken: string): Promise<ValidateCollabSessionResult>;
    /**
     * Revoke an active collaboration session.
     */
    revokeCollabSession(sessionId: string): Promise<void>;
    /**
     * List active sessions for a specific project.
     */
    listActiveSessions(projectId: string): Promise<CollabSession[]>;
    /**
     * Broadcast cursor position and active drawing sheet coordinates.
     */
    updateCursor(roomId: string, userId: string, cursor: CollabCursorData): Promise<void>;
    /**
     * Update full presence information (cursor, selection, viewport, device).
     */
    updatePresence(sessionId: string, userId: string, projectId: string, presenceData: Partial<CollabPresence>): Promise<CollabPresence>;
    /**
     * Get active presences for a project (within the last 5 minutes).
     */
    getProjectPresences(projectId: string): Promise<CollabPresence[]>;
    /**
     * Lock an element (drawing node, BOQ row, budget cell) for exclusive editing.
     */
    lockElement(roomId: string, userId: string, elementId: string): Promise<boolean>;
    /**
     * Unlock a previously locked element.
     */
    unlockElement(roomId: string, userId: string, elementId: string): Promise<boolean>;
    /**
     * Check if an element is currently locked.
     */
    isElementLocked(roomId: string, elementId: string): boolean;
    /**
     * Add a review comment or discussion note on a resource (drawing, material, task).
     */
    addComment(options: AddCommentOptions): Promise<CollabComment>;
    /**
     * Fetch comments attached to a specific resource.
     */
    getComments(resourceType: string, resourceId: string): Promise<CollabComment[]>;
    /**
     * Mark a comment thread as resolved.
     */
    resolveComment(commentId: string, resolvedBy: string, resourceType?: string, resourceId?: string): Promise<CollabComment | null>;
    /**
     * Save a point-in-time document snapshot for backup or version comparison.
     */
    saveDocumentSnapshot(options: SaveDocumentSnapshotOptions): Promise<CollabDocumentSnapshot>;
    /**
     * Get a document snapshot by version number or latest.
     */
    getDocumentSnapshot(projectId: string, documentType: string, version?: number): Promise<CollabDocumentSnapshot | null>;
    /**
     * Retrieve all snapshots for a project document.
     */
    getDocumentHistory(projectId: string, documentType: string, limit?: number): Promise<CollabDocumentSnapshot[]>;
    /**
     * Retrieve the audit change history for a project.
     */
    getChangeHistory(projectId: string, options?: {
        limit?: number;
        offset?: number;
        resourceType?: string;
    }): Promise<CollabChangeHistoryItem[]>;
    /**
     * Fetch chat messages for a project discussion channel.
     */
    fetchChatMessages(projectId: string, limit?: number): Promise<CollabChatMessage[]>;
    /**
     * Send a team chat message with optional file/photo attachments.
     */
    sendChatMessage(projectId: string, payload: SendChatMessagePayload): Promise<CollabChatMessage>;
    /**
     * Verify if a role has the specified permission key.
     */
    can(role: CollabRoleName, permission: CollabPermissionKey): boolean;
    /**
     * Retrieve the complete role definition by role ID.
     */
    getRoleDefinition(role: CollabRoleName): CollabRoleDefinition;
    broadcastMessage<T>(message: Omit<CollabMessage<T>, 'timestamp'>): Promise<CollabMessage<T>>;
    connectTransport(config: CollabTransportConfig, callbacks?: CollabTransportEvents): void;
    disconnectTransport(): void;
    get isTransportConnected(): boolean;
    private _handleTransportMessage;
    initDocument(data: Record<string, any>): CollabDocumentState;
    getDocumentState(): CollabDocumentState | null;
    applyLocalEdit(path: string, type: CollabOperation['type'], value?: any, oldValue?: any): CollabOperation | null;
    applyRemoteOperation(operation: CollabOperation): void;
    resolvePendingOperations(): void;
    destroy(): void;
}
