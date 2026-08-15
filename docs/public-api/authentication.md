# Authentication

All public API requests require authentication via API keys. Keys are scoped, rate-limited, and can expire.

## API Key Format

```
bpak_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
│     │
│     └─ 48 random characters (base62)
└─ Prefix: "bpak_" (Blueprin API Key)
```

**Length:** 53 characters total (`bpak_` + 48 random)

## Authentication Methods

### Header (Recommended)

```bash
curl -H "X-API-Key: bpak_xxxxxxxx" \
  "https://your-domain.com/api/public/ahs"
```

### Query Parameter

```bash
curl "https://your-domain.com/api/public/ahs?api_key=bpak_xxxxxxxx"
```

**Note:** Header method is recommended for security. Query params may be logged in server access logs.

---

## How It Works

### 1. Key Extraction

The `api-key-auth.js` middleware extracts the key from:

```javascript
// Priority order:
const apiKey = request.headers.get('x-api-key')
  || request.nextUrl.searchParams.get('api_key');
```

### 2. SHA-256 Hashing

Raw key is hashed before database lookup:

```javascript
const crypto = require('crypto');
const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
```

### 3. Database Lookup

```sql
SELECT id, user_id, plan_id, scopes, is_active, expires_at,
       request_count_today, request_count_month
FROM api_keys
WHERE key_hash = $1;
```

### 4. Validation Checks

| Check | Description | Error |
|-------|-------------|-------|
| Key exists | Hash matches a record | 401: "API key tidak valid" |
| `is_active` | Key not revoked | 403: "API key tidak aktif" |
| `expires_at` | Key not expired | 403: "API key sudah kedaluwarsa" |
| Scope match | Key has required scope | 403: "Scope tidak mencukupi" |
| Rate limit | Within limits | 429: "Rate limit terlampaui" |

---

## Creating API Keys

### Via API

```bash
POST /api/public/apikeys
Authorization: Bearer YOUR_SUPABASE_TOKEN
Content-Type: application/json

{
  "name": "Production API Key",
  "scopes": ["ahs", "materials"],
  "plan_code": "api_basic",
  "expires_in_days": 365
}
```

**Response (KEY SHOWN ONLY ONCE):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "api_key": "bpak_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "key_preview": "bpak_xxxx****",
    "name": "Production API Key",
    "warning": "Simpan API key ini sekarang. Key hanya ditampilkan sekali ini saja!"
  }
}
```

### Via Developer Portal

Navigate to `/home/api-keys` in the Blueprin app:

1. Click **Create API Key**
2. Enter name and description
3. Select scopes (ahs, materials, rab)
4. Choose plan (Free/Basic/Pro/Enterprise)
5. Set expiry (optional)
6. Click **Create**
7. **Copy the key immediately** — it won't be shown again

---

## Scopes

| Scope | Access | Description |
|-------|--------|-------------|
| `ahs` | `/api/public/ahs` | AHS (Analisa Harga Satuan) data |
| `materials` | `/api/public/materials` | Materials, upah, alat |
| `rab` | `/api/public/rab` | RAB per project |

### Scope Examples

```json
// Read-only access to AHS
"scopes": ["ahs"]

// Full access to all data
"scopes": ["ahs", "materials", "rab"]

// Materials + RAB only
"scopes": ["materials", "rab"]
```

---

## Rate Limiting

Rate limits are enforced per API key based on the assigned plan.

### Limits by Plan

| Plan | Per Second | Per Day | Per Month |
|------|------------|---------|-----------|
| Free | 2 | 100 | 2,000 |
| Basic | 5 | 1,000 | 30,000 |
| Pro | 20 | 5,000 | 150,000 |
| Enterprise | 100 | 50,000 | 1,500,000 |

### Rate Limit Headers

Every response includes:

```
X-RateLimit-Limit: 5          # Max requests per second
X-RateLimit-Remaining: 997    # Remaining in current window
X-RateLimit-Plan: api_basic   # Current plan
Retry-After: 1                # Seconds to wait (only on 429)
```

### 429 Response

```json
{
  "success": false,
  "error": "Rate limit terlampaui. Maksimal 5 request/detik.",
  "retry_after_ms": 850,
  "limit_type": "per_second"
}
```

### Implementation

```javascript
// src/lib/api-key-auth.js

const RATE_LIMITS = {
  api_free:        { perSecond: 2,   perDay: 100,   perMonth: 2000 },
  api_basic:       { perSecond: 5,   perDay: 1000,  perMonth: 30000 },
  api_pro:         { perSecond: 20,  perDay: 5000,  perMonth: 150000 },
  api_enterprise:  { perSecond: 100, perDay: 50000, perMonth: 1500000 },
};
```

---

## Key Management

### List Keys

```bash
GET /api/public/apikeys
Authorization: Bearer YOUR_TOKEN
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "key_preview": "bpak_xxxx****",
      "name": "Production Key",
      "scopes": ["ahs", "materials"],
      "plan_code": "api_basic",
      "is_active": true,
      "expires_at": "2027-08-15T00:00:00Z",
      "request_count_today": 45,
      "request_count_month": 1234,
      "created_at": "2026-08-15T00:00:00Z"
    }
  ]
}
```

### Revoke Key

```bash
DELETE /api/public/apikeys?id=uuid
Authorization: Bearer YOUR_TOKEN
```

**Response:**

```json
{
  "success": true,
  "message": "API key berhasil dihapus."
}
```

---

## Security Best Practices

### For API Consumers

1. **Never expose keys in client-side code** — use server-side only
2. **Use environment variables** — `process.env.BLUEPRIN_API_KEY`
3. **Rotate keys periodically** — create new, revoke old
4. **Use minimal scopes** — only request what you need
5. **Monitor usage** — check `/api/public/usage` regularly

### For Host App Operators

1. **Enforce HTTPS** — all API calls must use TLS
2. **Log all requests** — `api_usage_logs` table
3. **Set reasonable defaults** — Free plan limits prevent abuse
4. **Monitor for anomalies** — unusual traffic patterns
5. **Implement key expiry** — force periodic rotation

---

## Error Codes

| Code | Description |
|------|-------------|
| 401 | API key tidak valid (not found or invalid format) |
| 403 | API key tidak aktif / sudah kedaluwarsa / scope tidak mencukupi |
| 429 | Rate limit terlampaui (per-second or per-day) |
| 500 | Server error (contact support) |

---

## Troubleshooting

### "API key tidak valid"

- Check for typos in the key
- Ensure using correct header (`X-API-Key`)
- Verify key hasn't been revoked

### "API key sudah kedaluwarsa"

- Check `expires_at` in key list
- Create a new key with longer expiry
- Or remove expiry for non-expiring keys

### "Scope tidak mencukupi"

- Check required scope for endpoint
- Create new key with additional scopes
- Or update existing key scopes (not supported — create new)

### Rate limited (429)

- Wait for `Retry-After` duration
- Upgrade to higher plan for more capacity
- Implement request queuing in your app
