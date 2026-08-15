# API Endpoints

Complete documentation for all public API endpoints.

## Base URL

```
https://your-domain.com
```

All endpoints use the prefix `/api/public/`.

---

## AHS — Analisa Harga Satuan

### GET /api/public/ahs

Access AHS (Analisa Harga Satuan) data for construction cost analysis.

**Auth:** `X-API-Key` header or `?api_key=` query param  
**Scope:** `ahs`

#### Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | — | Specific AHS ID (returns detail + components) |
| `search` | string | `""` | Filter by kode/nama |
| `kelompok` | string | `""` | Filter: persiapan, tanah, pondasi, beton, dll |
| `limit` | number | `50` | Max 200 |
| `offset` | number | `0` | Pagination offset |

#### Example Request

```bash
curl -H "X-API-Key: bpak_xxxxxxxx" \
  "https://your-domain.com/api/public/ahs?kelompok=beton&limit=10"
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "kode": "AHS-001",
      "nama": "Pasangan Batu Bata",
      "satuan": "m3",
      "kelompok": "pasangan",
      "total_harga": 450000,
      "total_bahan": 280000,
      "total_upah": 150000,
      "total_alat": 20000,
      "component_count": 8
    }
  ],
  "pagination": {
    "total": 610,
    "limit": 10,
    "offset": 0,
    "has_more": true
  }
}
```

#### Detail Response (with `id` param)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "kode": "AHS-001",
    "nama": "Pasangan Batu Bata",
    "satuan": "m3",
    "kelompok": "pasangan",
    "total_harga": 450000,
    "components": [
      {
        "id": "uuid",
        "nama": "Bata Merah",
        "kategori": "MATERIAL",
        "satuan": "bh",
        "harga": 850,
        "jumlah": 120,
        "subtotal": 102000
      }
    ]
  }
}
```

#### Kelompok Values

| Value | Description |
|-------|-------------|
| `persiapan` | Persiapan kerja |
| `tanah` | Pekerjaan tanah |
| `pondasi` | Pekerjaan pondasi |
| `beton` | Pekerjaan beton |
| `pasangan` | Pekerjaan pasangan |
| `plesteran` | Pekerjaan plesteran |
| `penutup` | Pekerjaan penutup |
| `rangka` | Pekerjaan rangka |
| `atap` | Pekerjaan atap |
| `plafond` | Pekerjaan plafond |
| `lantai` | Pekerjaan lantai |
| `dinding` | Pekerjaan dinding |
| `kayu` | Pekerjaan kayu |
| `besi` | Pekerjaan besi |
| `pintu` | Pekerjaan pintu |
| `jendela` | Pekerjaan jendela |
| `finishing` | Pekerjaan finishing |
| `mekanikal` | Pekerjaan mekanikal |
| `elektrikal` | Pekerjaan elektrikal |

---

## Materials

### GET /api/public/materials

Access materials, upah (labor), and alat (tools) data.

**Auth:** `X-API-Key` header or `?api_key=` query param  
**Scope:** `materials`

#### Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | — | Specific material ID |
| `kategori` | string | `""` | `MATERIAL`/`BAHAN`, `UPAH`/`TENAGA`, `ALAT` |
| `search` | string | `""` | Filter by nama |
| `limit` | number | `50` | Max 200 |
| `offset` | number | `0` | Pagination offset |

#### Example Requests

```bash
# Get all materials
curl -H "X-API-Key: bpak_xxxxxxxx" \
  "https://your-domain.com/api/public/materials?kategori=material"

# Get all upah/tk
curl -H "X-API-Key: bpak_xxxxxxxx" \
  "https://your-domain.com/api/public/materials?kategori=upah&limit=20"

# Get all alat
curl -H "X-API-Key: bpak_xxxxxxxx" \
  "https://your-domain.com/api/public/materials?kategori=alat"

# Search materials
curl -H "X-API-Key: bpak_xxxxxxxx" \
  "https://your-domain.com/api/public/materials?search=bata+merah"
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "nama": "Bata Merah",
      "kategori": "MATERIAL",
      "satuan": "bh",
      "harga": 850
    }
  ],
  "pagination": {
    "total": 245,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

#### Supported Kategori Values

| Input | Maps To | Description |
|-------|---------|-------------|
| `MATERIAL`, `BAHAN` | `MATERIAL` | Building materials |
| `UPAH`, `TENAGA`, `KERJA`, `PEKERJA`, `JASA`, `LABOR` | `UPAH` | Labor costs |
| `ALAT`, `PERALATAN`, `TOOL`, `TOOLS` | `ALAT` | Equipment/tools |

---

## RAB — Rencana Anggaran Biaya

### GET /api/public/rab

Access RAB (Rencana Anggaran Biaya) data per project.

**Auth:** `X-API-Key` header or `?api_key=` query param  
**Scope:** `rab`

#### Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `project_id` | string | Yes | Project ID |
| `search` | string | No | Filter by uraian/kode |
| `kategori` | string | No | `MATERIAL`, `UPAH`, `ALAT` |
| `limit` | number | `50` | Max 200 |
| `offset` | number | `0` | Pagination offset |

#### Example Request

```bash
curl -H "X-API-Key: bpak_xxxxxxxx" \
  "https://your-domain.com/api/public/rab?project_id=uuid&kategori=MATERIAL"
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "kode": "RAB-001",
      "uraian": "Pekerjaan Pondasi Batu Kali",
      "kategori": "MATERIAL",
      "satuan": "m3",
      "volume": 25,
      "harga_satuan": 450000,
      "total": 11250000
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

---

## Plans

### GET /api/public/plans

List available API plans. **No authentication required.**

#### Example Request

```bash
curl "https://your-domain.com/api/public/plans"
```

#### Response

```json
{
  "success": true,
  "data": [
    {
      "code": "api_free",
      "name": "Free",
      "price_amount": 0,
      "currency": "IDR",
      "requests_per_day": 100,
      "requests_per_month": 2000,
      "rate_limit_per_second": 2,
      "duration_days": 30,
      "features": ["ahs", "materials"]
    },
    {
      "code": "api_basic",
      "name": "Basic",
      "price_amount": 25000,
      "currency": "IDR",
      "requests_per_day": 1000,
      "requests_per_month": 30000,
      "rate_limit_per_second": 5,
      "duration_days": 30,
      "features": ["ahs", "materials", "rab"]
    },
    {
      "code": "api_pro",
      "name": "Pro",
      "price_amount": 100000,
      "currency": "IDR",
      "requests_per_day": 5000,
      "requests_per_month": 150000,
      "rate_limit_per_second": 20,
      "duration_days": 30,
      "features": ["ahs", "materials", "rab", "priority"]
    },
    {
      "code": "api_enterprise",
      "name": "Enterprise",
      "price_amount": 0,
      "currency": "IDR",
      "requests_per_day": 50000,
      "requests_per_month": 1500000,
      "rate_limit_per_second": 100,
      "duration_days": 365,
      "features": ["ahs", "materials", "rab", "priority", "support"]
    }
  ]
}
```

---

## Checkout

### POST /api/public/checkout

Purchase a paid API plan via DOKU payment gateway.

**Auth:** Bearer token (login required)

#### Request Body

```json
{
  "plan_code": "api_basic",
  "currency": "IDR"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://sandbox.doku.com/...",
    "amount": 25000,
    "currency": "IDR",
    "plan": {
      "code": "api_basic",
      "name": "Basic"
    }
  }
}
```

#### Error Response

```json
{
  "success": false,
  "error": "Plan tidak ditemukan."
}
```

---

## API Keys

### POST /api/public/apikeys

Create a new API key.

**Auth:** Bearer token (login required)

#### Request Body

```json
{
  "name": "My App Key",
  "scopes": ["ahs", "materials"],
  "plan_code": "api_free",
  "expires_in_days": 365
}
```

#### Response (KEY SHOWN ONLY ONCE)

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "api_key": "bpak_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "key_preview": "bpak_xxxx****",
    "name": "My App Key",
    "warning": "Simpan API key ini sekarang. Key hanya ditampilkan sekali ini saja!"
  }
}
```

### GET /api/public/apikeys

List all API keys for the authenticated user.

**Auth:** Bearer token (login required)

#### Response

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

### DELETE /api/public/apikeys

Revoke an API key.

**Auth:** Bearer token (login required)  
**Params:** `?id=uuid`

#### Response

```json
{
  "success": true,
  "message": "API key berhasil dihapus."
}
```

---

## Usage

### GET /api/public/usage

Get usage statistics for the authenticated user's API keys.

**Auth:** Bearer token (login required)

#### Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `detail` | boolean | `false` | Breakdown per endpoint |
| `days` | number | `30` | Period in days |

#### Example Request

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://your-domain.com/api/public/usage?detail=true&days=7"
```

#### Response

```json
{
  "success": true,
  "data": {
    "period": {
      "days": 7,
      "start": "2026-08-08T00:00:00Z",
      "end": "2026-08-15T00:00:00Z"
    },
    "total_requests": 1234,
    "by_status": {
      "200": 1180,
      "400": 30,
      "429": 20,
      "500": 4
    },
    "by_endpoint": [
      { "endpoint": "/api/public/ahs", "count": 500 },
      { "endpoint": "/api/public/materials", "count": 400 },
      { "endpoint": "/api/public/rab", "count": 334 }
    ],
    "by_key": [
      { "key_preview": "bpak_xxxx****", "count": 800 },
      { "key_preview": "bpak_yyyy****", "count": 434 }
    ]
  }
}
```

---

## Pagination

All list endpoints support pagination:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | `50` | Max items per page (max 200) |
| `offset` | number | `0` | Number of items to skip |

### Pagination Response

```json
{
  "pagination": {
    "total": 610,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

### Pagination Example

```bash
# Page 1
curl -H "X-API-Key: bpak_xxxxxxxx" \
  "https://your-domain.com/api/public/ahs?limit=50&offset=0"

# Page 2
curl -H "X-API-Key: bpak_xxxxxxxx" \
  "https://your-domain.com/api/public/ahs?limit=50&offset=50"

# Page 3
curl -H "X-API-Key: bpak_xxxxxxxx" \
  "https://your-domain.com/api/public/ahs?limit=50&offset=100"
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message in Indonesian",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid parameters |
| 401 | `UNAUTHORIZED` | API key tidak valid |
| 403 | `FORBIDDEN` | Scope tidak mencukupi / key tidak aktif |
| 404 | `NOT_FOUND` | Resource not found |
| 429 | `RATE_LIMITED` | Rate limit terlampaui |
| 500 | `INTERNAL_ERROR` | Server error |

---

## Rate Limit Response Headers

Every successful response includes:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 997
X-RateLimit-Plan: api_basic
```

On 429 error:

```
Retry-After: 1
```
