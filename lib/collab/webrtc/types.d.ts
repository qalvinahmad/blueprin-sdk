/**
 * @alvinahmad/blueprin-sdk - WebRTC Voice Call & Media Mesh Signaling Types
 *
 * Types for peer-to-peer audio calls, STUN/TURN ICE negotiation,
 * participant presence, mute states, and mesh signaling.
 */
export type CallState = 'idle' | 'requesting' | 'calling' | 'ringing' | 'connecting' | 'connected' | 'ended';
export interface CallParticipant {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    isMuted: boolean;
    isSpeaking?: boolean;
    isYou: boolean;
    joinedAt?: string;
}
export interface IceServerConfig {
    urls: string | string[];
    username?: string;
    credential?: string;
}
export declare const DEFAULT_STUN_SERVERS: IceServerConfig[];
export type SignalingMessageType = 'offer' | 'answer' | 'ice_candidate' | 'mute_state' | 'call_request' | 'call_ended' | 'participant_joined' | 'participant_left';
export interface WebRTCSignalingMessage<T = any> {
    type: SignalingMessageType;
    roomId: string;
    senderId: string;
    senderName?: string;
    senderAvatar?: string;
    targetId?: string;
    payload: T;
    timestamp: string;
}
export interface RTCSessionDescriptionInit {
    type: 'offer' | 'answer' | 'pranswer' | 'rollback';
    sdp: string;
}
export interface RTCIceCandidateInit {
    candidate: string;
    sdpMid?: string | null;
    sdpMLineIndex?: number | null;
    usernameFragment?: string | null;
}
export interface VoiceCallOptions {
    /** STUN/TURN ICE server configuration */
    iceServers?: IceServerConfig[];
    /** Audio media track constraints or boolean flag */
    audioConstraints?: boolean | Record<string, any>;
    /** Auto answer incoming ringing calls */
    autoAnswer?: boolean;
    /** Custom signaling send handler */
    onSendSignaling?: (msg: WebRTCSignalingMessage) => void | Promise<void>;
}
export interface VoiceCallEvents {
    onStateChange?: (state: CallState) => void;
    onParticipantsChange?: (participants: CallParticipant[]) => void;
    onRemoteStream?: (stream: any, participantId: string) => void;
    onError?: (error: Error) => void;
    onMuteChange?: (isMuted: boolean) => void;
    onSpeakingChange?: (userId: string, isSpeaking: boolean) => void;
}
