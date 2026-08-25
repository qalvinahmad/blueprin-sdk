/**
 * @alvinahmad/blueprin-sdk - VoiceCallClient
 *
 * Real-time WebRTC Voice Calling and Media Mesh Signaling Client.
 * Enables peer-to-peer audio communications, ICE candidate exchange,
 * live mute state synchronization, and participant mesh management.
 */
import type { CallState, CallParticipant, IceServerConfig, WebRTCSignalingMessage, VoiceCallOptions, VoiceCallEvents, RTCIceCandidateInit } from './types.js';
export interface VoiceCallClientConfig {
    events: any;
    storage?: any;
    defaultIceServers?: IceServerConfig[];
}
export declare class VoiceCallClient {
    private _events;
    private _storage;
    private _callState;
    private _isMuted;
    private _currentRoomId;
    private _currentUserId;
    private _currentUserName;
    private _currentUserAvatar;
    private _participants;
    private _peerConnections;
    private _localStream;
    private _iceServers;
    private _customSignalingHandler?;
    private _listeners;
    constructor({ events, storage, defaultIceServers }: VoiceCallClientConfig);
    get callState(): CallState;
    get isMuted(): boolean;
    get currentRoomId(): string | null;
    get participants(): CallParticipant[];
    /**
     * Set user identity for voice call sessions.
     */
    setUser(userId: string, name: string, avatar?: string): void;
    /**
     * Register event callbacks for voice state changes.
     */
    on(events: VoiceCallEvents): void;
    /**
     * Start an outgoing voice call in the given project room.
     */
    startCall(roomId: string, options?: VoiceCallOptions): Promise<void>;
    /**
     * Answer an incoming ringing voice call.
     */
    answerCall(options?: VoiceCallOptions): Promise<void>;
    /**
     * Terminate the current voice call and release audio resources.
     */
    endCall(): Promise<void>;
    /**
     * Toggle local microphone mute state.
     */
    toggleMute(): boolean;
    /**
     * Set local microphone mute state explicitly.
     */
    setMute(muted: boolean): boolean;
    /**
     * Handle incoming WebRTC signaling message (offer, answer, ICE candidate, mute state).
     */
    handleSignalingMessage(message: WebRTCSignalingMessage): Promise<void>;
    /**
     * Add ICE candidate from a remote peer.
     */
    addIceCandidate(candidate: RTCIceCandidateInit, peerId?: string): Promise<void>;
    private _setCallState;
    private _notifyParticipantsChange;
    private _acquireMicrophone;
    private _createOffer;
    private _createAnswer;
    private _getOrCreatePeerConnection;
    private _sendSignalingMessage;
    private _cleanup;
    destroy(): void;
}
