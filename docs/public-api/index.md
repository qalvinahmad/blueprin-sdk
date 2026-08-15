# Public API

Blueprin provides a RESTful public API for third-party integrations. Access construction data (AHS, materials, RAB) programmatically with API key authentication.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     CLIENT / 3RD PARTY                   │
│  Header: X-API-Key: bpak_xxxxx atau ?api_key=bpak_xxx   │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│              MIDDLEWARE (middleware.js)                   │
│  /api/public/* → PUBLIC (no cookie auth needed)          │
│  /api/webhooks/* → PUBLIC (webhook DOKU)                 │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│           api-key-auth.js (Autentikasi)                  │
│  1. Extract key dari X-API-Key header / ?api_key=        │
│  2. Hash SHA-256 → lookup di api_keys table              │
│  3. Cek: is_active, expires_at, scopes                   │
│  4. Rate limit check (per-second + per-day)              │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│               PUBLIC API ROUTES                          │
│  /api/public/ahs        → AHS (Analisa Harga Satuan)    │
│  /api/public/materials   → Materials, Upah, Alat         │
│  /api/public/rab        → RAB (per-project)              │
│  /api/public/plans      → Daftar paket (public)          │
│  /api/public/checkout   → DOKU checkout (auth user)      │
│  /api/public/apikeys    → CRUD API keys (auth user)      │
│  /api/public/usage      → Statistik penggunaan           │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│         WEBHOOK: /api/webhooks/doku-api-payment          │
│  DOKU notification → verify signature → activate plan    │
└──────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Get an API Key

Sign up at `/home/api-keys` or use the API:

```bash
curl -X POST https://your-domain.com/api/public/apikeys \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "My App", "scopes": ["ahs", "materials"], "plan_code": "api_free"}'
```

### 2. Make a Request

```bash
curl -H "X-API-Key: bpak_xxxxxxxxxxxx" \
  "https://your-domain.com/api/public/ahs?kelompok=beton&limit=10"
```

### 3. Check Usage

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://your-domain.com/api/public/usage?days=30"
```

---

## Available Endpoints

| Endpoint | Method | Auth | Scope | Description |
|----------|--------|------|-------|-------------|
| `/api/public/ahs` | GET | API Key | `ahs` | AHS (Analisa Harga Satuan) data |
| `/api/public/materials` | GET | API Key | `materials` | Materials, upah, alat |
| `/api/public/rab` | GET | API Key | `rab` | RAB per project |
| `/api/public/plans` | GET | None | — | Available API plans |
| `/api/public/checkout` | POST | Bearer | — | DOKU checkout for paid plans |
| `/api/public/apikeys` | GET/POST/DELETE | Bearer | — | Manage API keys |
| `/api/public/usage` | GET | Bearer | — | Usage statistics |

---

## Plans & Pricing

| Plan | Per Second | Per Day | Per Month | Price |
|------|------------|---------|-----------|-------|
| Free | 2 | 100 | 2,000 | Free |
| Basic | 5 | 1,000 | 30,000 | Rp 25,000 |
| Pro | 20 | 5,000 | 150,000 | Rp 100,000 |
| Enterprise | 100 | 50,000 | 1,500,000 | Custom |

---

## Rate Limiting

Every response includes rate limit headers:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 997
X-RateLimit-Plan: api_basic
Retry-After: 1
```

When exceeded, returns 429:

```json
{
  "success": false,
  "error": "Rate limit terlampaui. Maksimal 5 request/detik.",
  "retry_after_ms": 850,
  "limit_type": "per_second"
}
```

---

## Security

- **API Key Hashing** — Keys are SHA-256 hashed before storage. Raw key shown only once.
- **Scope-based Access** — Each key only accesses specified endpoints.
- **Rate Limiting** — Per-second and per-day limits per plan.
- **Usage Logging** — All requests logged for audit.
- **Expiry** — Keys can auto-expire.
- **RLS** — Row-Level Security: users only manage their own keys.

---

## See Also

- [Authentication](./authentication.md) — API key auth & rate limiting details
- [Endpoints](./endpoints.md) — Full endpoint documentation
- [Webhooks](./webhooks.md) — DOKU payment webhook handling
- [Integration Examples](./integration.md) — Code samples in JavaScript, Python, cURL
