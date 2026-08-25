/**
 * @alvinahmad/blueprin-sdk - Real-time Collaboration Module
 */

export { CollabClient } from './collab-client.js';
export type { CollabClientOptions } from './collab-client.js';
export { CollabTransport } from './collab-transport.js';
export {
  createOperation,
  applyOperation,
  resolveConflicts,
  incrementClock,
  mergeClocks,
  happenedBefore,
  areConcurrent,
} from './collab-crdt.js';
export { COLLAB_ROLE_DEFINITIONS } from './types.js';
export type {
  CollabUser,
  CollabRoom,
  CollabMessage,
  CollabOperation,
  CollabTransportConfig,
  CollabTransportEvents,
  CollabDocumentState,
  CollabRoleName,
  CollabPermissionKey,
  CollabRoleDefinition,
  CollabCollaborator,
  InviteCollaboratorOptions,
  CollabInviteResult,
  CreateCollabSessionOptions,
  CollabSession,
  ValidateCollabSessionResult,
  CollabCursorData,
  CollabPresence,
  CollabComment,
  AddCommentOptions,
  CollabDocumentSnapshot,
  SaveDocumentSnapshotOptions,
  CollabChangeHistoryItem,
  CollabChatMessage,
  SendChatMessagePayload,
} from './types.js';

// WebRTC Voice Calling & Media Mesh Signaling
export { VoiceCallClient, DEFAULT_STUN_SERVERS } from './webrtc/index.js';
export type {
  VoiceCallClientConfig,
  CallState,
  CallParticipant,
  IceServerConfig,
  SignalingMessageType,
  WebRTCSignalingMessage,
  VoiceCallOptions,
  VoiceCallEvents,
  RTCIceCandidateInit,
  RTCSessionDescriptionInit,
} from './webrtc/index.js';
