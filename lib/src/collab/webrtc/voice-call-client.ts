/**
 * @alvinahmad/blueprin-sdk - VoiceCallClient
 *
 * Real-time WebRTC Voice Calling and Media Mesh Signaling Client.
 * Enables peer-to-peer audio communications, ICE candidate exchange,
 * live mute state synchronization, and participant mesh management.
 */

import { generateId } from '../../utils/index.js';
import type {
  CallState,
  CallParticipant,
  IceServerConfig,
  WebRTCSignalingMessage,
  VoiceCallOptions,
  VoiceCallEvents,
  RTCIceCandidateInit,
  RTCSessionDescriptionInit,
} from './types.js';
import { DEFAULT_STUN_SERVERS } from './types.js';

export interface VoiceCallClientConfig {
  events: any;
  storage?: any;
  defaultIceServers?: IceServerConfig[];
}

export class VoiceCallClient {
  private _events: any;
  private _storage: any;
  private _callState: CallState = 'idle';
  private _isMuted: boolean = false;
  private _currentRoomId: string | null = null;
  private _currentUserId: string = 'anon';
  private _currentUserName: string = 'User';
  private _currentUserAvatar: string = '';
  private _participants: Map<string, CallParticipant> = new Map();
  private _peerConnections: Map<string, any> = new Map();
  private _localStream: any = null;
  private _iceServers: IceServerConfig[];
  private _customSignalingHandler?: (msg: WebRTCSignalingMessage) => void | Promise<void>;
  private _listeners: VoiceCallEvents = {};

  constructor({ events, storage, defaultIceServers }: VoiceCallClientConfig) {
    this._events = events;
    this._storage = storage;
    this._iceServers = defaultIceServers || DEFAULT_STUN_SERVERS;
  }

  // ─── Getters ─────────────────────────────────────────────────────────────

  get callState(): CallState {
    return this._callState;
  }

  get isMuted(): boolean {
    return this._isMuted;
  }

  get currentRoomId(): string | null {
    return this._currentRoomId;
  }

  get participants(): CallParticipant[] {
    return Array.from(this._participants.values());
  }

  // ─── Configuration & User Setup ──────────────────────────────────────────

  /**
   * Set user identity for voice call sessions.
   */
  setUser(userId: string, name: string, avatar?: string): void {
    this._currentUserId = userId;
    this._currentUserName = name;
    this._currentUserAvatar =
      avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
  }

  /**
   * Register event callbacks for voice state changes.
   */
  on(events: VoiceCallEvents): void {
    this._listeners = { ...this._listeners, ...events };
  }

  // ─── Call Lifecycle ──────────────────────────────────────────────────────

  /**
   * Start an outgoing voice call in the given project room.
   */
  async startCall(roomId: string, options: VoiceCallOptions = {}): Promise<void> {
    if (this._callState !== 'idle' && this._callState !== 'ended') {
      return;
    }

    this._currentRoomId = roomId;
    if (options.iceServers) this._iceServers = options.iceServers;
    if (options.onSendSignaling) this._customSignalingHandler = options.onSendSignaling;

    this._setCallState('requesting');

    try {
      this._localStream = await this._acquireMicrophone(options.audioConstraints);
      this._setCallState('calling');

      // Add self to participants
      const selfParticipant: CallParticipant = {
        id: this._currentUserId,
        name: this._currentUserName,
        avatar: this._currentUserAvatar,
        isMuted: this._isMuted,
        isSpeaking: false,
        isYou: true,
        joinedAt: new Date().toISOString(),
      };
      this._participants.set(this._currentUserId, selfParticipant);
      this._notifyParticipantsChange();

      // Create initial WebRTC offer
      const offer = await this._createOffer(this._currentRoomId);

      // Broadcast call request / offer to peers
      await this._sendSignalingMessage({
        type: 'offer',
        roomId: this._currentRoomId,
        senderId: this._currentUserId,
        senderName: this._currentUserName,
        senderAvatar: this._currentUserAvatar,
        payload: { offer },
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      this._setCallState('idle');
      this._events.emit('blueprin:voice:error', { error: err });
      this._listeners.onError?.(err);
      throw err;
    }
  }

  /**
   * Answer an incoming ringing voice call.
   */
  async answerCall(options: VoiceCallOptions = {}): Promise<void> {
    if (this._callState !== 'ringing' && this._callState !== 'calling') {
      return;
    }

    if (!this._currentRoomId) {
      throw new Error('No active incoming call to answer.');
    }

    if (options.iceServers) this._iceServers = options.iceServers;
    if (options.onSendSignaling) this._customSignalingHandler = options.onSendSignaling;

    this._setCallState('requesting');

    try {
      this._localStream = await this._acquireMicrophone(options.audioConstraints);
      this._setCallState('connecting');

      // Add self to participants
      const selfParticipant: CallParticipant = {
        id: this._currentUserId,
        name: this._currentUserName,
        avatar: this._currentUserAvatar,
        isMuted: this._isMuted,
        isSpeaking: false,
        isYou: true,
        joinedAt: new Date().toISOString(),
      };
      this._participants.set(this._currentUserId, selfParticipant);
      this._notifyParticipantsChange();

      // Create answer
      const answer = await this._createAnswer(this._currentRoomId);

      // Broadcast answer to room
      await this._sendSignalingMessage({
        type: 'answer',
        roomId: this._currentRoomId,
        senderId: this._currentUserId,
        senderName: this._currentUserName,
        senderAvatar: this._currentUserAvatar,
        payload: { answer },
        timestamp: new Date().toISOString(),
      });

      this._setCallState('connected');
    } catch (err: any) {
      this._setCallState('idle');
      this._events.emit('blueprin:voice:error', { error: err });
      this._listeners.onError?.(err);
      throw err;
    }
  }

  /**
   * Terminate the current voice call and release audio resources.
   */
  async endCall(): Promise<void> {
    if (this._callState === 'idle') return;

    const roomId = this._currentRoomId;

    if (roomId) {
      await this._sendSignalingMessage({
        type: 'call_ended',
        roomId,
        senderId: this._currentUserId,
        payload: { userId: this._currentUserId },
        timestamp: new Date().toISOString(),
      }).catch(() => {});
    }

    this._cleanup();
    this._setCallState('ended');
  }

  // ─── Mute Control ────────────────────────────────────────────────────────

  /**
   * Toggle local microphone mute state.
   */
  toggleMute(): boolean {
    return this.setMute(!this._isMuted);
  }

  /**
   * Set local microphone mute state explicitly.
   */
  setMute(muted: boolean): boolean {
    this._isMuted = muted;

    if (this._localStream && typeof this._localStream.getAudioTracks === 'function') {
      this._localStream.getAudioTracks().forEach((track: any) => {
        track.enabled = !muted;
      });
    }

    const self = this._participants.get(this._currentUserId);
    if (self) {
      self.isMuted = muted;
      this._notifyParticipantsChange();
    }

    if (this._currentRoomId) {
      this._sendSignalingMessage({
        type: 'mute_state',
        roomId: this._currentRoomId,
        senderId: this._currentUserId,
        payload: { isMuted: muted },
        timestamp: new Date().toISOString(),
      }).catch(() => {});
    }

    this._events.emit('blueprin:voice:muted', { isMuted: muted });
    this._listeners.onMuteChange?.(muted);
    return this._isMuted;
  }

  // ─── Signaling Message Dispatcher ────────────────────────────────────────

  /**
   * Handle incoming WebRTC signaling message (offer, answer, ICE candidate, mute state).
   */
  async handleSignalingMessage(message: WebRTCSignalingMessage): Promise<void> {
    if (message.senderId === this._currentUserId) {
      return; // Ignore own messages
    }

    switch (message.type) {
      case 'offer': {
        if (this._callState === 'idle' || this._callState === 'ended') {
          this._currentRoomId = message.roomId;
          this._setCallState('ringing');

          // Register caller in participant list
          this._participants.set(message.senderId, {
            id: message.senderId,
            name: message.senderName || 'Caller',
            avatar: message.senderAvatar,
            isMuted: false,
            isYou: false,
            joinedAt: message.timestamp,
          });
          this._notifyParticipantsChange();
        }
        break;
      }

      case 'answer': {
        if (this._callState === 'calling' || this._callState === 'connecting') {
          this._setCallState('connected');

          // Register callee
          this._participants.set(message.senderId, {
            id: message.senderId,
            name: message.senderName || 'Participant',
            avatar: message.senderAvatar,
            isMuted: false,
            isYou: false,
            joinedAt: message.timestamp,
          });
          this._notifyParticipantsChange();
        }
        break;
      }

      case 'ice_candidate': {
        const { candidate } = message.payload || {};
        if (candidate) {
          await this.addIceCandidate(candidate, message.senderId);
        }
        break;
      }

      case 'mute_state': {
        const { isMuted } = message.payload || {};
        const participant = this._participants.get(message.senderId);
        if (participant) {
          participant.isMuted = Boolean(isMuted);
          this._notifyParticipantsChange();
        }
        break;
      }

      case 'call_ended': {
        this._participants.delete(message.senderId);
        this._notifyParticipantsChange();

        // If only self remains or room ended
        if (this._participants.size <= 1) {
          this._cleanup();
          this._setCallState('ended');
        }
        break;
      }
    }
  }

  /**
   * Add ICE candidate from a remote peer.
   */
  async addIceCandidate(candidate: RTCIceCandidateInit, peerId?: string): Promise<void> {
    const pc = peerId ? this._peerConnections.get(peerId) : this._peerConnections.values().next().value;
    if (pc && typeof pc.addIceCandidate === 'function') {
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        // Ignore candidate race errors
      }
    }
  }

  // ─── Internal Helpers ────────────────────────────────────────────────────

  private _setCallState(nextState: CallState): void {
    this._callState = nextState;
    this._events.emit('blueprin:voice:state', { state: nextState });
    this._listeners.onStateChange?.(nextState);
  }

  private _notifyParticipantsChange(): void {
    const list = this.participants;
    this._events.emit('blueprin:voice:participants', { participants: list });
    this._listeners.onParticipantsChange?.(list);
  }

  private async _acquireMicrophone(constraints?: boolean | Record<string, any>): Promise<any> {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      return navigator.mediaDevices.getUserMedia({
        audio: constraints ?? true,
        video: false,
      });
    }

    // Mock stream for testing or Node environment
    return {
      getAudioTracks: () => [{ enabled: true, stop: () => {} }],
      getTracks: () => [{ enabled: true, stop: () => {} }],
    };
  }

  private async _createOffer(roomId: string): Promise<RTCSessionDescriptionInit> {
    const pc = this._getOrCreatePeerConnection('default');
    if (pc && typeof pc.createOffer === 'function') {
      const offer = await pc.createOffer();
      if (typeof pc.setLocalDescription === 'function') {
        await pc.setLocalDescription(offer);
      }
      return offer;
    }

    return {
      type: 'offer',
      sdp: `v=0\r\no=- ${Date.now()} 2 IN IP4 127.0.0.1\r\ns=Blueprin Voice Call ${roomId}\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n`,
    };
  }

  private async _createAnswer(roomId: string): Promise<RTCSessionDescriptionInit> {
    const pc = this._getOrCreatePeerConnection('default');
    if (pc && typeof pc.createAnswer === 'function') {
      const answer = await pc.createAnswer();
      if (typeof pc.setLocalDescription === 'function') {
        await pc.setLocalDescription(answer);
      }
      return answer;
    }

    return {
      type: 'answer',
      sdp: `v=0\r\no=- ${Date.now()} 2 IN IP4 127.0.0.1\r\ns=Blueprin Voice Call Answer ${roomId}\r\nt=0 0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n`,
    };
  }

  private _getOrCreatePeerConnection(peerId: string): any {
    if (this._peerConnections.has(peerId)) {
      return this._peerConnections.get(peerId);
    }

    if (typeof RTCPeerConnection !== 'undefined') {
      const pc = new RTCPeerConnection({
        iceServers: this._iceServers,
      });

      pc.onicecandidate = ({ candidate }: any) => {
        if (candidate && this._currentRoomId) {
          this._sendSignalingMessage({
            type: 'ice_candidate',
            roomId: this._currentRoomId,
            senderId: this._currentUserId,
            payload: { candidate: candidate.toJSON ? candidate.toJSON() : candidate },
            timestamp: new Date().toISOString(),
          }).catch(() => {});
        }
      };

      pc.ontrack = ({ streams }: any) => {
        if (streams && streams[0]) {
          this._listeners.onRemoteStream?.(streams[0], peerId);
        }
      };

      this._peerConnections.set(peerId, pc);
      return pc;
    }

    // Lightweight mock for non-browser / test runs
    const mockPC = {
      createOffer: async () => ({ type: 'offer', sdp: 'mock_sdp_offer' }),
      createAnswer: async () => ({ type: 'answer', sdp: 'mock_sdp_answer' }),
      setLocalDescription: async () => {},
      setRemoteDescription: async () => {},
      addIceCandidate: async () => {},
      close: () => {},
    };
    this._peerConnections.set(peerId, mockPC);
    return mockPC;
  }

  private async _sendSignalingMessage(message: WebRTCSignalingMessage): Promise<void> {
    if (this._customSignalingHandler) {
      await this._customSignalingHandler(message);
    }

    this._events.emit('blueprin:voice:signaling', message);
  }

  private _cleanup(): void {
    if (this._localStream && typeof this._localStream.getTracks === 'function') {
      this._localStream.getTracks().forEach((track: any) => track.stop?.());
    }
    this._localStream = null;

    this._peerConnections.forEach((pc) => {
      if (typeof pc.close === 'function') pc.close();
    });
    this._peerConnections.clear();

    this._participants.clear();
    this._currentRoomId = null;
    this._isMuted = false;
    this._notifyParticipantsChange();
  }

  destroy(): void {
    this.endCall();
    this._listeners = {};
  }
}
