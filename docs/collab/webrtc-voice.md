# WebRTC Voice Call & Media Mesh Signaling (`@alvinahmad/blueprin-sdk/collab`)

The WebRTC Voice Call module allows real-time interactive peer-to-peer audio calls and team voice rooms directly integrated with Blueprin collaborative project workspaces.

---

## Features

- **P2P Audio Streaming**: True peer-to-peer low-latency WebRTC `RTCPeerConnection` audio pipeline.
- **Media Mesh Signaling**: Broadcast and handle WebRTC offers, answers, and ICE candidate trickling over WebSocket or database signaling.
- **Participant Presence**: Live tracking of call participants, remote avatars, mute status, and speaking states.
- **Mute / Unmute Synchronization**: Control local microphone hardware track while simultaneously broadcasting mute status to all connected room peers.
- **Multi-STUN Resilience**: Built-in Google STUN fallback infrastructure for NAT traversal and firewalled network environments.
- **Framework & SSR Safe**: Works across modern browsers, Electron desktop containers, and headless environments.

---

## Quick Start

```ts
import { BlueprinSDK, VoiceCallClient } from '@alvinahmad/blueprin-sdk';

const sdk = new BlueprinSDK({ appId: 'voice-enabled-app' });
await sdk.init();

// Configure user identity
sdk.collab.voice.setUser('user-101', 'Alvin Ahmad', 'https://example.com/avatar.png');

// Listen for state changes
sdk.collab.voice.on({
  onStateChange: (state) => console.log('Call State:', state), // 'idle' | 'calling' | 'ringing' | 'connected' | 'ended'
  onParticipantsChange: (members) => console.log('Active in call:', members),
  onMuteChange: (isMuted) => console.log('Mic muted:', isMuted),
  onError: (err) => console.error('Voice error:', err),
});

// 1. Start an outgoing call
await sdk.collab.voice.startCall('project-room-42', {
  onSendSignaling: (msg) => {
    // Route WebRTC signaling message via your WebSocket or Supabase Realtime channel
    sdk.collab.broadcastMessage({
      roomId: msg.roomId,
      senderId: msg.senderId,
      type: 'chat',
      payload: msg,
    });
  },
});

// 2. Answer incoming call
if (sdk.collab.voice.callState === 'ringing') {
  await sdk.collab.voice.answerCall();
}

// 3. Toggle mute
const isMuted = sdk.collab.voice.toggleMute();

// 4. End call
await sdk.collab.voice.endCall();
```

---

## Signaling Message Handling

When integrating with an external pub/sub channel (e.g. Supabase Realtime or WebSocket server), forward received signaling packets to `VoiceCallClient`:

```ts
// Example: Listening to room broadcast messages
sdk.events.on('blueprin:collab:chat', async (message) => {
  if (message.payload?.type && ['offer', 'answer', 'ice_candidate', 'mute_state', 'call_ended'].includes(message.payload.type)) {
    await sdk.collab.voice.handleSignalingMessage(message.payload);
  }
});
```

---

## API Reference

### `VoiceCallClient`

| Method / Property | Description |
|---|---|
| `callState` | Current call state (`'idle' \| 'requesting' \| 'calling' \| 'ringing' \| 'connecting' \| 'connected' \| 'ended'`). |
| `isMuted` | Boolean flag indicating whether local audio microphone is currently muted. |
| `participants` | Array of active `CallParticipant` objects in the current call room. |
| `setUser(userId, name, avatar?)` | Sets local user identity for voice call packets. |
| `startCall(roomId, options?)` | Initiates an outgoing call and generates an SDP offer. |
| `answerCall(options?)` | Answers an incoming ringing call and generates an SDP answer. |
| `endCall()` | Hangs up the call and releases microphone and connection resources. |
| `toggleMute()` | Toggles local microphone track enabled/disabled state. |
| `setMute(muted)` | Explicitly mutes or unmutes local microphone. |
| `handleSignalingMessage(msg)` | Dispatches incoming signaling message (`offer`, `answer`, `ice_candidate`, `mute_state`, `call_ended`). |
| `addIceCandidate(candidate, peerId?)` | Adds ICE candidate to active peer connection. |
| `on(events)` | Registers event listener callbacks for state and participant changes. |
| `destroy()` | Cleans up all connections and listeners. |
