import { describe, it, expect, beforeEach } from 'vitest';
import { BlueprinSDK } from '../lib/src/core/sdk.ts';
import { VoiceCallClient, DEFAULT_STUN_SERVERS } from '../lib/src/collab/index.ts';
import type { WebRTCSignalingMessage } from '../lib/src/collab/index.ts';

describe('WebRTC Voice Call & Media Mesh Signaling SDK Suite', () => {
  let sdk: BlueprinSDK;

  beforeEach(async () => {
    sdk = new BlueprinSDK({ appId: 'test-webrtc-suite' });
    await sdk.init();
  });

  describe('1. Initialization & Default Configuration', () => {
    it('initializes VoiceCallClient with default idle state and STUN servers', () => {
      expect(sdk.collab.voice).toBeInstanceOf(VoiceCallClient);
      expect(sdk.collab.voice.callState).toBe('idle');
      expect(sdk.collab.voice.isMuted).toBe(false);
      expect(sdk.collab.voice.participants.length).toBe(0);
      expect(DEFAULT_STUN_SERVERS.length).toBeGreaterThan(0);
    });

    it('sets user identity for call sessions', () => {
      sdk.collab.voice.setUser('user-101', 'Alvin Ahmad', 'https://avatar.com/alvin.png');
      expect(sdk.collab.voice.callState).toBe('idle');
    });
  });

  describe('2. Outgoing Call Flow & Mesh Signaling', () => {
    it('initiates call, acquires audio stream, and broadcasts offer signaling', async () => {
      const dispatchedSignals: WebRTCSignalingMessage[] = [];

      sdk.collab.voice.setUser('caller-1', 'Lead Architect');

      let stateChanges: string[] = [];
      sdk.collab.voice.on({
        onStateChange: (state) => stateChanges.push(state),
      });

      await sdk.collab.voice.startCall('proj-room-99', {
        onSendSignaling: (msg) => {
          dispatchedSignals.push(msg);
        },
      });

      expect(sdk.collab.voice.callState).toBe('calling');
      expect(sdk.collab.voice.currentRoomId).toBe('proj-room-99');
      expect(stateChanges).toContain('requesting');
      expect(stateChanges).toContain('calling');

      expect(dispatchedSignals.length).toBe(1);
      expect(dispatchedSignals[0].type).toBe('offer');
      expect(dispatchedSignals[0].roomId).toBe('proj-room-99');
      expect(dispatchedSignals[0].senderId).toBe('caller-1');
      expect(dispatchedSignals[0].payload.offer).toBeDefined();

      // Check self in participants
      const participants = sdk.collab.voice.participants;
      expect(participants.length).toBe(1);
      expect(participants[0].id).toBe('caller-1');
      expect(participants[0].isYou).toBe(true);
    });
  });

  describe('3. Incoming Call Flow, Answer Negotiation & Mute Control', () => {
    it('handles incoming offer, rings, answers call, and transitions to connected', async () => {
      const callerSignals: WebRTCSignalingMessage[] = [];
      const calleeSignals: WebRTCSignalingMessage[] = [];

      const callerSdk = new BlueprinSDK({ appId: 'caller-sdk' });
      await callerSdk.init();
      callerSdk.collab.voice.setUser('caller-1', 'Pak Hendra (PM)');

      const calleeSdk = new BlueprinSDK({ appId: 'callee-sdk' });
      await calleeSdk.init();
      calleeSdk.collab.voice.setUser('callee-2', 'Budi (Site Engineer)');

      // Caller starts call
      await callerSdk.collab.voice.startCall('room-alpha', {
        onSendSignaling: (msg) => callerSignals.push(msg),
      });

      // Callee receives offer signal
      const offerSignal = callerSignals.find((s) => s.type === 'offer');
      expect(offerSignal).toBeDefined();
      await calleeSdk.collab.voice.handleSignalingMessage(offerSignal!);

      expect(calleeSdk.collab.voice.callState).toBe('ringing');
      expect(calleeSdk.collab.voice.participants.some((p) => p.id === 'caller-1')).toBe(true);

      // Callee answers call
      await calleeSdk.collab.voice.answerCall({
        onSendSignaling: (msg) => calleeSignals.push(msg),
      });

      expect(calleeSdk.collab.voice.callState).toBe('connected');

      // Callee sends answer back to caller
      const answerSignal = calleeSignals.find((s) => s.type === 'answer');
      expect(answerSignal).toBeDefined();
      await callerSdk.collab.voice.handleSignalingMessage(answerSignal!);

      expect(callerSdk.collab.voice.callState).toBe('connected');
      expect(callerSdk.collab.voice.participants.length).toBe(2);

      // Callee toggles mute
      calleeSdk.collab.voice.toggleMute();
      expect(calleeSdk.collab.voice.isMuted).toBe(true);

      // End call
      await callerSdk.collab.voice.endCall();
      expect(callerSdk.collab.voice.callState).toBe('ended');
    });
  });

  describe('4. ICE Candidate Exchange & Mesh Teardown', () => {
    it('processes ICE candidates and handles call ended notifications', async () => {
      sdk.collab.voice.setUser('user-a', 'Operator');
      await sdk.collab.voice.startCall('room-beta');

      // Remote ICE candidate arrives
      await expect(
        sdk.collab.voice.handleSignalingMessage({
          type: 'ice_candidate',
          roomId: 'room-beta',
          senderId: 'user-b',
          payload: {
            candidate: {
              candidate: 'candidate:842163049 1 udp 1677729535 192.168.1.5 54321 typ host',
              sdpMid: '0',
              sdpMLineIndex: 0,
            },
          },
          timestamp: new Date().toISOString(),
        })
      ).resolves.not.toThrow();

      // Remote user ends call
      await sdk.collab.voice.handleSignalingMessage({
        type: 'call_ended',
        roomId: 'room-beta',
        senderId: 'user-b',
        payload: { userId: 'user-b' },
        timestamp: new Date().toISOString(),
      });

      expect(sdk.collab.voice.callState).toBe('ended');
    });
  });
});
