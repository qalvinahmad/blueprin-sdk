# Integration Examples

Code samples for integrating with the Blueprin Public API.

## JavaScript / Node.js

### Basic Setup

```javascript
const BASE_URL = 'https://your-domain.com';
const API_KEY = 'bpak_xxxxxxxxxxxx';

async function blueprinAPI(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}/api/public${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    headers: { 'X-API-Key': API_KEY },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
```

### List AHS

```javascript
// Get AHS with filter
const ahs = await blueprinAPI('/ahs', {
  kelompok: 'beton',
  limit: 10,
});

console.log(`Found ${ahs.pagination.total} AHS items`);
ahs.data.forEach(item => {
  console.log(`${item.kode}: ${item.nama} - Rp ${item.total_harga.toLocaleString()}`);
});
```

### Get AHS Detail

```javascript
const detail = await blueprinAPI('/ahs', { id: 'uuid-of-ahs' });
console.log(`Components: ${detail.data.components.length}`);
```

### Search Materials

```javascript
const materials = await blueprinAPI('/materials', {
  search: 'bata merah',
  kategori: 'material',
});

materials.data.forEach(item => {
  console.log(`${item.nama} (${item.satuan}): Rp ${item.harga.toLocaleString()}`);
});
```

### Get All Upah/Tenaga Kerja

```javascript
const upah = await blueprinAPI('/materials', {
  kategori: 'upah',
  limit: 200,
});

console.log(`Total upah: ${upah.pagination.total}`);
```

### Get RAB by Project

```javascript
const rab = await blueprinAPI('/rab', {
  project_id: 'project-uuid',
  kategori: 'MATERIAL',
  limit: 50,
});

rab.data.forEach(item => {
  console.log(`${item.uraian}: ${item.volume} ${item.satuan} × Rp ${item.harga_satuan.toLocaleString()}`);
  console.log(`  Total: Rp ${item.total.toLocaleString()}`);
});
```

### Pagination

```javascript
// Fetch all pages
let offset = 0;
const limit = 200;
let hasMore = true;
const allItems = [];

while (hasMore) {
  const result = await blueprinAPI('/ahs', { limit, offset });
  allItems.push(...result.data);
  hasMore = result.pagination.has_more;
  offset += limit;
}

console.log(`Total AHS fetched: ${allItems.length}`);
```

### Error Handling

```javascript
async function safeAPICall(endpoint, params) {
  try {
    const result = await blueprinAPI(endpoint, params);
    return { success: true, data: result };
  } catch (error) {
    if (error.message.includes('429')) {
      console.error('Rate limited. Waiting 1 second...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return safeAPICall(endpoint, params); // Retry
    }
    return { success: false, error: error.message };
  }
}
```

---

## cURL

### List AHS

```bash
curl -H "X-API-Key: bpak_xxxxxxxx" \
  "https://your-domain.com/api/public/ahs?kelompok=beton&limit=10"
```

### Search Materials

```bash
curl -H "X-API-Key: bpak_xxxxxxxx" \
  "https://your-domain.com/api/public/materials?search=bata+merah&kategori=material"
```

### Get Upah

```bash
curl -H "X-API-Key: bpak_xxxxxxxx" \
  "https://your-domain.com/api/public/materials?kategori=upah"
```

### Get Alat

```bash
curl -H "X-API-Key: bpak_xxxxxxxx" \
  "https://your-domain.com/api/public/materials?kategori=alat"
```

### Get RAB

```bash
curl -H "X-API-Key: bpak_xxxxxxxx" \
  "https://your-domain.com/api/public/rab?project_id=uuid&kategori=MATERIAL"
```

### List Plans (No Auth)

```bash
curl "https://your-domain.com/api/public/plans"
```

### Create API Key

```bash
curl -X POST https://your-domain.com/api/public/apikeys \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My App Key",
    "scopes": ["ahs", "materials"],
    "plan_code": "api_free"
  }'
```

### List API Keys

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://your-domain.com/api/public/apikeys"
```

### Revoke API Key

```bash
curl -X DELETE "https://your-domain.com/api/public/apikeys?id=uuid" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Usage

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://your-domain.com/api/public/usage?detail=true&days=30"
```

---

## Python

### Basic Setup

```python
import requests

BASE_URL = "https://your-domain.com"
API_KEY = "bpak_xxxxxxxxxxxx"

def blueprin_api(endpoint, params=None):
    url = f"{BASE_URL}/api/public{endpoint}"
    headers = {"X-API-Key": API_KEY}
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    return response.json()
```

### List AHS

```python
# Get AHS with filter
ahs = blueprin_api("/ahs", {"kelompok": "beton", "limit": 10})

print(f"Found {ahs['pagination']['total']} AHS items")
for item in ahs["data"]:
    print(f"{item['kode']}: {item['nama']} - Rp {item['total_harga']:,}")
```

### Search Materials

```python
materials = blueprin_api("/materials", {
    "search": "bata merah",
    "kategori": "material"
})

for item in materials["data"]:
    print(f"{item['nama']} ({item['satuan']}): Rp {item['harga']:,}")
```

### Get All Upah

```python
upah = blueprin_api("/materials", {"kategori": "upah", "limit": 200})
print(f"Total upah: {upah['pagination']['total']}")
```

### Get RAB

```python
rab = blueprin_api("/rab", {
    "project_id": "project-uuid",
    "kategori": "MATERIAL"
})

for item in rab["data"]:
    print(f"{item['uraian']}: {item['volume']} {item['satuan']}")
    print(f"  Rp {item['harga_satuan']:,} × {item['volume']} = Rp {item['total']:,}")
```

### Pagination

```python
def fetch_all_ahs():
    offset = 0
    limit = 200
    all_items = []
    
    while True:
        result = blueprin_api("/ahs", {"limit": limit, "offset": offset})
        all_items.extend(result["data"])
        
        if not result["pagination"]["has_more"]:
            break
        offset += limit
    
    return all_items

all_ahs = fetch_all_ahs()
print(f"Total AHS fetched: {len(all_ahs)}")
```

### Error Handling with Retry

```python
import time

def safe_api_call(endpoint, params=None, max_retries=3):
    for attempt in range(max_retries):
        try:
            return blueprin_api(endpoint, params)
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 429:
                retry_after = int(e.response.headers.get("Retry-After", 1))
                print(f"Rate limited. Waiting {retry_after}s...")
                time.sleep(retry_after)
            else:
                raise
    raise Exception("Max retries exceeded")
```

---

## PHP

### Basic Setup

```php
<?php

$baseUrl = 'https://your-domain.com';
$apiKey = 'bpak_xxxxxxxxxxxx';

function blueprinAPI($endpoint, $params = []) {
    global $baseUrl, $apiKey;
    
    $url = $baseUrl . '/api/public' . $endpoint;
    if (!empty($params)) {
        $url .= '?' . http_build_query($params);
    }
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["X-API-Key: $apiKey"]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}
```

### List AHS

```php
$ahs = blueprinAPI('/ahs', ['kelompok' => 'beton', 'limit' => 10]);

echo "Found {$ahs['pagination']['total']} AHS items\n";
foreach ($ahs['data'] as $item) {
    echo "{$item['kode']}: {$item['nama']} - Rp " . number_format($item['total_harga']) . "\n";
}
```

---

## Go

### Basic Setup

```go
package main

import (
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "net/url"
)

const (
    BaseURL = "https://your-domain.com"
    APIKey  = "bpak_xxxxxxxxxxxx"
)

func blueprinAPI(endpoint string, params map[string]string) (map[string]interface{}, error) {
    u, _ := url.Parse(BaseURL + "/api/public" + endpoint)
    
    q := u.Query()
    for k, v := range params {
        q.Set(k, v)
    }
    u.RawQuery = q.Encode()
    
    req, _ := http.NewRequest("GET", u.String(), nil)
    req.Header.Set("X-API-Key", APIKey)
    
    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()
    
    body, _ := io.ReadAll(resp.Body)
    var result map[string]interface{}
    json.Unmarshal(body, &result)
    
    return result, nil
}
```

### List AHS

```go
func main() {
    result, err := blueprinAPI("/ahs", map[string]string{
        "kelompok": "beton",
        "limit":    "10",
    })
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    data := result["data"].([]interface{})
    fmt.Printf("Found %v AHS items\n", result["pagination"].(map[string]interface{})["total"])
    
    for _, item := range data {
        ahs := item.(map[string]interface{})
        fmt.Printf("%s: %s - Rp %v\n", ahs["kode"], ahs["nama"], ahs["total_harga"])
    }
}
```

---

## React / Frontend

### Hook for API Data

```javascript
import { useState, useEffect } from 'react';

function useBlueprinAPI(endpoint, params = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = new URL(`/api/public${endpoint}`, window.location.origin);
        Object.entries(params).forEach(([key, value]) => {
          if (value) url.searchParams.set(key, value);
        });

        const response = await fetch(url, {
          headers: { 'X-API-Key': process.env.NEXT_PUBLIC_BLUEPRIN_API_KEY },
        });

        if (!response.ok) throw new Error('API error');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, JSON.stringify(params)]);

  return { data, loading, error };
}
```

### Usage Example

```javascript
function AHSTable({ kelompok }) {
  const { data, loading, error } = useBlueprinAPI('/ahs', {
    kelompok,
    limit: 20,
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>Kode</th>
          <th>Nama</th>
          <th>Satuan</th>
          <th>Total Harga</th>
        </tr>
      </thead>
      <tbody>
        {data.data.map(item => (
          <tr key={item.id}>
            <td>{item.kode}</td>
            <td>{item.nama}</td>
            <td>{item.satuan}</td>
            <td>Rp {item.total_harga.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## Rate Limiting Best Practices

### Implement Exponential Backoff

```javascript
async function fetchWithRetry(endpoint, params, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(`${BASE_URL}/api/public${endpoint}`, {
        headers: { 'X-API-Key': API_KEY },
      });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
        const delay = retryAfter * 1000 * Math.pow(2, attempt);
        console.log(`Rate limited. Waiting ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      return await response.json();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
    }
  }
}
```

### Cache Responses

```javascript
const cache = new Map();

async function cachedAPICall(endpoint, params, ttl = 60000) {
  const key = `${endpoint}?${JSON.stringify(params)}`;
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const data = await blueprinAPI(endpoint, params);
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

---

## Environment Variables

```bash
# For your app
BLUEPRIN_API_KEY=bpak_xxxxxxxxxxxx
BLUEPRIN_BASE_URL=https://your-domain.com

# For DOKU webhooks (host app)
DOKU_SECRET_KEY=your-doku-secret
DOKU_CLIENT_ID=your-client-id
DOKU_API_KEY=your-api-key
```
