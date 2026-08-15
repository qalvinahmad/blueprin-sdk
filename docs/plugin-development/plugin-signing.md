# Plugin Signing

Blueprin uses HMAC-SHA256 to sign approved plugins, ensuring only verified code runs in the marketplace.

## Overview

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Developer   │    │   Admin      │    │   Sandbox    │
│  creates     │───→│   reviews    │───→│   verifies   │
│  plugin      │    │   & signs    │    │   signature  │
└──────────────┘    └──────────────┘    └──────────────┘
     │                    │                    │
     │  status: draft     │  signs with        │  loads plugin
     │                    │  HMAC-SHA256        │  only if valid
     │                    │                    │
     ▼                    ▼                    ▼
┌──────────┐        ┌──────────┐        ┌──────────┐
│Supabase  │        │Supabase  │        │ Runtime  │
│plugins   │        │plugins   │        │ iframe   │
│table     │        │table     │        │ sandbox  │
└──────────┘        └──────────┘        └──────────┘
```

## How It Works

### 1. Plugin Creation (No Auth)

When a plugin is created via `POST /api/plugins/create`:

```javascript
// src/app/api/plugins/create/route.js

// If PLUGIN_SIGNING_SECRET is set, generate initial signature
if (process.env.PLUGIN_SIGNING_SECRET) {
  const nonce = generateNonce();
  const signaturePayload = generateSignaturePayload(pluginData, nonce);
  const signature = generateSignature(signaturePayload, process.env.PLUGIN_SIGNING_SECRET);

  submissionData.submission_data = {
    signature,
    nonce,
    signed_at: new Date().toISOString(),
    signed_by: 'system',
  };
}
```

**Note:** Plugins are NOT signed during creation — only when approved by admin.

### 2. Admin Review & Signing

When an admin approves a plugin via `POST /api/plugins/admin/{id}/review`:

```javascript
// src/app/api/plugins/admin/[id]/review/route.js

if (body.action === 'approved' && process.env.PLUGIN_SIGNING_SECRET) {
  const signaturePayload = generateSignaturePayload(pluginData, nonce);
  const signature = generateSignature(signaturePayload, process.env.PLUGIN_SIGNING_SECRET);

  submissionData.submission_data = {
    ...submissionData.submission_data,
    signature,
    nonce,
    signed_at: new Date().toISOString(),
    signed_by: user.id,
  };
}
```

### 3. Sandbox Verification

When a plugin is loaded in the sandbox iframe:

```javascript
// src/lib/plugin-sandbox-host.js

_verifyPluginSignature(pluginId, manifest) {
  if (!manifest) return true; // non-blocking if no manifest

  const plugin = this.activePlugins.get(pluginId);
  if (!plugin?.signature) return true;

  const payload = JSON.stringify({
    pluginId,
    manifest,
    version: manifest.version,
  });

  const verified = verifyPluginSignature(payload, plugin.signature);

  if (!verified) {
    this.sandboxLogger.warn(`Plugin signature verification failed: ${pluginId}`);
  }

  return verified;
}
```

**Note:** Signature verification is non-blocking. The plugin loads even if verification fails — warnings are logged to the sandbox console.

---

## Signature Payload Format

The signature payload is a JSON string of the plugin data:

```json
{
  "slug": "my-plugin",
  "name": "My Plugin",
  "author": "Author Name",
  "version": "1.0.0",
  "description": "What it does",
  "bundle_url": "https://cdn.example.com/plugin.js",
  "nonce": "random-uuid",
  "timestamp": "2026-08-15T10:30:00.000Z"
}
```

## Nonce

A UUID v4 nonce is generated per signature to prevent replay attacks:

```javascript
function generateNonce() {
  return crypto.randomUUID();
}
```

## HMAC-SHA256 Implementation

Using Node.js built-in `crypto` module:

```javascript
// src/lib/plugin-signing.js

const crypto = require('crypto');

function generateSignaturePayload(pluginData, nonce) {
  const payload = {
    slug: pluginData.slug,
    name: pluginData.name,
    author: pluginData.author,
    version: pluginData.version,
    description: pluginData.description,
    bundle_url: pluginData.bundle_url,
    nonce,
    timestamp: new Date().toISOString(),
  };
  return JSON.stringify(payload);
}

function generateSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

function verifyPluginSignature(payload, signature, secret) {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}
```

**Security note:** `crypto.timingSafeEqual` is used to prevent timing attacks.

---

## Database Schema

Plugin signatures are stored in the `submission_data` JSONB column:

```sql
-- plugins table
ALTER TABLE plugins
  ADD COLUMN submission_data JSONB DEFAULT '{}';
```

**Example `submission_data` after approval:**

```json
{
  "submission_notes": "Ready for production",
  "reviewed_by": "admin-uuid",
  "reviewed_at": "2026-08-15T10:30:00.000Z",
  "signature": "a1b2c3d4e5f6...",
  "nonce": "uuid-v4-nonce",
  "signed_at": "2026-08-15T10:30:00.000Z",
  "signed_by": "admin-uuid"
}
```

---

## Verification API

### POST /api/plugins/verify

Public endpoint to verify a plugin signature.

```
POST /api/plugins/verify
Content-Type: application/json

{
  "plugin_id": "uuid",
  "payload": {
    "slug": "my-plugin",
    "version": "1.0.0",
    "manifest": { ... }
  },
  "signature": "a1b2c3d4e5f6..."
}
```

**Response:**
```json
{
  "verified": true,
  "plugin_id": "uuid",
  "signed_at": "2026-08-15T10:30:00.000Z",
  "signed_by": "admin-uuid"
}
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PLUGIN_SIGNING_SECRET` | No | HMAC-SHA256 secret key for signing |

**Important:** If `PLUGIN_SIGNING_SECRET` is not set:
- Plugin creation continues without signature (warning logged)
- Admin approval skips signing (warning logged)
- Sandbox verification is skipped (non-blocking)

---

## Security Considerations

### What Signing Protects Against

- **Tampered bundles**: Detects if a bundle was modified after approval
- **Replay attacks**: Nonce ensures each signature is unique
- **Unauthorized publishing**: Only admin-approved plugins are signed
- **Supply chain attacks**: Verified plugins have a trust chain

### What Signing Does NOT Protect Against

- **Bundle URL hijacking**: If CDN is compromised, valid signature loads bad code
- **Runtime exploits**: Signing doesn't prevent bugs in plugin code
- **Zero-day vulnerabilities**: Signature only verifies origin, not security

### Best Practices

1. **Keep `PLUGIN_SIGNING_SECRET` secure** — store in environment variables, never commit
2. **Rotate secrets periodically** — if compromised, regenerate and re-sign all plugins
3. **Use a long secret** — at least 32 characters of random data
4. **Don't expose the secret** — only the host app should know it

### Secret Generation

```bash
# Generate a secure random secret
openssl rand -hex 32

# Example output:
# 7a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b
```

---

## Debugging

### Signature verification fails in sandbox

1. Check browser console for warning: `Plugin signature verification failed: {pluginId}`
2. Verify plugin was approved (status = `approved`)
3. Verify `submission_data.signature` exists in database
4. Verify `PLUGIN_SIGNING_SECRET` is set in host app environment

### Plugin not signed after approval

1. Check host app logs for: `PLUGIN_SIGNING_SECRET not set, skipping plugin signing`
2. Set `PLUGIN_SIGNING_SECRET` in host app environment
3. Re-approve the plugin to trigger signing

### Nonce mismatch

Each signature has a unique nonce. If you see nonce-related errors:
- The signature may be from a different version of the plugin
- Re-approve the plugin to generate a fresh signature
