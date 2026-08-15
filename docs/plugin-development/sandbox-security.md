# Sandbox & Security Model

Blueprin plugins run in isolated sandboxes with strict security boundaries. This document explains how plugins are contained, what they can access, and how security is enforced.

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  Blueprin Host App                               │
│                                                  │
│  ┌───────────────────────────────────────────┐   │
│  │  Plugin Host (iframe)                      │   │
│  │                                            │   │
│  │  ┌─────────────────────────────────────┐   │   │
│  │  │  Plugin Code (untrusted)             │   │   │
│  │  │                                      │   │   │
│  │  │  - Loaded via <iframe srcdoc>        │   │   │
│  │  │  - Runs in same-origin              │   │   │
│  │  │  - Sandbox attributes enforced      │   │   │
│  │  │  - CSP headers applied              │   │   │
│  │  │  - Rate limited                     │   │   │
│  │  │  - Communication via postMessage    │   │   │
│  │  └─────────────────────────────────────┘   │   │
│  │                                            │   │
│  │  Plugin Host Context                        │   │
│  │  - PluginManager (lifecycle)               │   │
│  │  - EventBridge (postMessage)               │   │
│  │  - StorageAdapter (localStorage)           │   │
│  │  - HookRegistry (scoped)                   │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
│  Supabase (database, auth, RLS)                  │
└─────────────────────────────────────────────────┘
```

## Sandbox Isolation

### iframe srcdoc

Plugins are loaded via `<iframe srcdoc>` — the plugin code is injected as HTML/JS directly into the iframe:

```javascript
// src/lib/plugin-sandbox-host.js

_createPluginFrame(pluginId, manifest) {
  const frame = document.createElement('iframe');
  frame.sandbox = 'allow-scripts allow-same-origin';
  frame.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
  `;
  frame.srcdoc = this._generateSandboxHTML(pluginId, manifest);

  return frame;
}
```

### Sandbox Attributes

| Attribute | Allowed | Purpose |
|-----------|---------|---------|
| `allow-scripts` | Yes | Execute JavaScript |
| `allow-same-origin` | Yes | Access cookies/storage |
| `allow-forms` | No | Prevent form submissions |
| `allow-popups` | No | Prevent new windows |
| `allow-modals` | No | Prevent alert/confirm/prompt |
| `allow-top-navigation` | No | Prevent frame escaping |

### Content Security Policy (CSP)

The sandboxed iframe has strict CSP headers:

```html
<meta http-equiv="Content-Security-Policy"
  content="
    default-src 'none';
    script-src 'unsafe-inline' 'unsafe-eval';
    style-src 'unsafe-inline';
    img-src * data:;
    font-src * data:;
    connect-src https://*.supabase.co;
    frame-src 'none';
    object-src 'none';
  "
/>
```

**CSP Rules:**
| Directive | Value | Effect |
|-----------|-------|--------|
| `default-src` | `'none'` | Block all by default |
| `script-src` | `'unsafe-inline' 'unsafe-eval'` | Allow plugin code execution |
| `style-src` | `'unsafe-inline'` | Allow inline styles |
| `img-src` | `* data:` | Allow images from any source |
| `connect-src` | `https://*.supabase.co` | Only Supabase API calls |
| `frame-src` | `'none'` | Prevent nested frames |
| `object-src` | `'none'` | Prevent plugins (Flash, Java, etc.) |

---

## Permission Scopes

Plugins declare required permissions in their manifest:

```javascript
definePlugin({
  id: 'my-plugin',
  permissions: ['storage:read', 'events:emit', 'rab:read'],
  // ...
});
```

### Available Permissions

| Permission | Access | Description |
|------------|--------|-------------|
| `storage:read` | Scoped storage | Read plugin's own data |
| `storage:write` | Scoped storage | Write plugin's own data |
| `events:emit` | Scoped event bus | Emit events to host app |
| `events:listen` | Scoped event bus | Listen to host app events |
| `rab:read` | RAB data | Read RAB calculations |
| `rab:write` | RAB data | Modify RAB data |
| `materials:read` | Materials | Read material database |
| `materials:write` | Materials | Modify materials |
| `projects:read` | Projects | Read project data |
| `projects:write` | Projects | Modify project data |
| `ui:menus` | UI injection | Add custom menu items |
| `ui:panels` | UI injection | Render custom panels |
| `ui:modals` | UI injection | Open modal dialogs |
| `ui:toasts` | UI injection | Show toast notifications |
| `network:http` | External API | Make HTTP requests to external APIs |
| `network:websocket` | WebSocket | WebSocket connections |

### Storage Isolation

Each plugin's storage is automatically scoped:

```javascript
// Plugin "my-plugin"
await ctx.storage.set('settings', { theme: 'dark' });
// Stored at: blueprin_sdk:plugin:my-plugin:settings

// Plugin "other-plugin" cannot access this data
await ctx.storage.get('settings');
// Returns: undefined (different namespace)
```

### Event Isolation

Events are scoped to prevent cross-plugin interference:

```javascript
// Plugin A emits an event
ctx.events.emit('blueprin:rab:calculated', { total: 5000000 });

// Plugin B can listen (if it has events:listen permission)
ctx.events.on('blueprin:rab:calculated', (data) => {
  // data.total = 5000000
});
```

---

## Rate Limiting

Plugins are rate-limited to prevent abuse:

```javascript
// src/lib/plugin-sandbox-host.js

const RATE_LIMITS = {
  requests: { max: 50, windowMs: 1000 }, // 50 req/s
  events: { max: 100, windowMs: 1000 },   // 100 events/s
  storage: { max: 20, windowMs: 1000 },   // 20 ops/s
};
```

**When exceeded:**
- Requests: Plugin receives error response
- Events: Events are dropped silently
- Storage: Operations fail gracefully

**Rate limit headers** are returned to the plugin:
```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1692088200
```

---

## Communication Protocol

### Host → Plugin (postMessage)

```javascript
// Host sends command
frame.contentWindow.postMessage({
  type: 'blueprin:plugin:command',
  id: commandId,
  method: 'activate',
  params: { manifest: pluginData },
}, '*');
```

### Plugin → Host (postMessage)

```javascript
// Plugin sends response
window.parent.postMessage({
  type: 'blueprin:plugin:response',
  id: commandId,
  result: { api: { myMethod: () => 'result' } },
}, '*');
```

### Event Bridge

```javascript
// Host → Plugin event
frame.contentWindow.postMessage({
  type: 'blueprin:event',
  event: 'blueprin:project:created',
  data: { project: { id: 'uuid', name: 'Project A' } },
}, '*');

// Plugin → Host event
window.parent.postMessage({
  type: 'blueprin:event',
  event: 'my-plugin:data-updated',
  data: { count: 42 },
}, '*');
```

---

## What Plugins CAN Do

✅ **Access their own scoped storage**
✅ **Listen to host app events**
✅ **Emit events to host app**
✅ **Read RAB/project/material data** (with permission)
✅ **Render UI in designated panels**
✅ **Make HTTP requests to allowed domains**
✅ **Use modern JavaScript (ES2022+)**

## What Plugins CANNOT Do

❌ **Access other plugins' data**
❌ **Access the host app's DOM directly**
❌ **Open new windows or popups**
❌ **Use form submissions**
❌ **Navigate the top frame**
❌ **Access the filesystem**
❌ **Use WebAssembly** (not enabled in CSP)
❌ **Access the camera/microphone** (not enabled)
❌ **Make arbitrary network requests** (only allowed domains)

---

## Plugin Lifecycle Security

### 1. Registration

```javascript
// Plugin manifest is validated
{
  id: 'my-plugin',          // required
  name: 'My Plugin',        // required
  version: '1.0.0',         // required, semver
  permissions: [...],       // validated against allowlist
}
```

### 2. Activation

```javascript
// activate() runs in sandboxed iframe
activate(ctx) {
  // ctx is a proxy object with limited access
  // ctx.sdk → scoped SDK instance
  // ctx.storage → scoped storage
  // ctx.events → scoped event bus
  // ctx.hooks → scoped hook registry
  // ctx.logger → scoped logger
}
```

### 3. Runtime

- Code runs in isolated iframe
- Rate limits enforced
- CSP headers block unauthorized resources
- postMessage for all host communication

### 4. Deactivation

```javascript
// deactivate() called for cleanup
deactivate(instance) {
  // Plugin must clean up:
  // - Clear intervals/timeouts
  // - Close connections
  // - Remove event listeners
}
```

### 5. Removal

- iframe is removed from DOM
- Plugin's scoped storage is preserved (can be cleared by user)
- Plugin's event listeners are removed
- Plugin's hooks are deregistered

---

## Signing & Trust

Plugins go through a trust chain:

```
Developer creates → Admin reviews → Admin signs → Host verifies → Plugin loads
```

**Signing details:** See [Plugin Signing](./plugin-signing.md)

**Sandbox verification:**
```javascript
// Signature is checked when plugin is loaded
_verifyPluginSignature(pluginId, manifest) {
  // If no signature → warn, but still load (non-blocking)
  // If signature invalid → warn, but still load (non-blocking)
  // If signature valid → load normally
}
```

**Note:** Signature verification is non-blocking — plugins load even if verification fails. This prevents a broken signing system from bricking all plugins.

---

## Attack Vectors & Mitigations

### 1. XSS via Plugin Code

**Risk:** Malicious plugin steals user data

**Mitigation:**
- iframe sandbox prevents DOM access to parent
- CSP blocks arbitrary script sources
- Storage is scoped per plugin
- postMessage is validated

### 2. Supply Chain Attack

**Risk:** Compromised CDN serves malicious code

**Mitigation:**
- Admin reviews plugin before approval
- Plugin is signed with HMAC-SHA256
- Host verifies signature before loading
- Users can report suspicious plugins

### 3. Rate Limit Abuse

**Risk:** Plugin floods host with requests

**Mitigation:**
- 50 requests/second per plugin
- 100 events/second per plugin
- Rate limit headers returned to plugin
- Excessive abuse → plugin suspended

### 4. Data Exfiltration

**Risk:** Plugin sends user data to external server

**Mitigation:**
- CSP restricts `connect-src` to allowed domains
- Only `https://*.supabase.co` is allowed
- No arbitrary HTTP requests
- Plugin must declare `network:http` permission

### 5. Privilege Escalation

**Risk:** Plugin accesses unauthorized data

**Mitigation:**
- Permissions are validated at registration
- Storage is scoped per plugin
- Events are scoped per plugin
- Host enforces permission checks

---

## Debugging

### Enable Debug Mode

```javascript
// Host app
const sdk = new BlueprinSDK({
  debug: true, // enables verbose logging
});
```

### Sandbox Console

Plugin logs go to the sandbox console:

```javascript
// In plugin code
ctx.logger.info('Plugin activated');
ctx.logger.warn('Something might be wrong');
ctx.logger.error('Error occurred');
```

**Note:** Plugin logs are NOT accessible from the host app console. Each iframe has its own console.

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Plugin doesn't load | CSP violation | Check browser console for CSP errors |
| Storage not working | Wrong namespace | Ensure `storage:read`/`storage:write` permission |
| Events not received | Missing permission | Add `events:listen` to permissions |
| Rate limit hit | Too many requests | Reduce request frequency |
| Signature fails | Wrong secret | Check `PLUGIN_SIGNING_SECRET` env var |

---

## Security Best Practices

### For Plugin Developers

1. **Declare only needed permissions** — minimal privilege principle
2. **Don't hardcode secrets** — use scoped storage for sensitive data
3. **Handle errors gracefully** — don't crash the sandbox
4. **Clean up in deactivate()** — prevent memory leaks
5. **Test in sandbox** — use the sandbox simulator before publishing

### For Host App Operators

1. **Set `PLUGIN_SIGNING_SECRET`** — enable plugin signing
2. **Review plugins before approval** — manual code review
3. **Monitor rate limits** — watch for abuse patterns
4. **Keep CSP strict** — don't weaken sandbox restrictions
5. **Rotate signing secrets** — periodically regenerate keys

### For Users

1. **Install only verified plugins** — look for the verification badge
2. **Report suspicious behavior** — use the in-app reporting feature
3. **Keep plugins updated** — check for new versions regularly
4. **Review permissions** — understand what plugin can access
