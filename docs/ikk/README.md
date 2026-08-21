# IKK (Construction Cost Index)

The Construction Cost Index (Indeks Kemahalan Konstruksi / IKK) is a statistical indicator published annually by BPS (Badan Pusat Statistik) that measures relative construction costs across Indonesian regions.

## Overview

IKK compares construction costs in each region to a reference city. The reference city has IKK = 100, and other regions are measured relative to it.

| Year | Reference City | IKK |
|------|----------------|-----|
| 2024 | Banjarmasin | 100 |
| 2023 | Makassar | 100 |
| 2022 | Makassar | 100 |
| 2021 | Makassar | 100 |
| 2020 | Semarang | 100 |
| 2019 | Semarang | 100 |

### Key Concepts

- **IKK = 100**: Costs equal the reference city
- **IKK > 100**: More expensive than reference (e.g., DKI Jakarta = 114.79)
- **IKK < 100**: Cheaper than reference (e.g., Lampung = 89.12)
- **Formula**: `adjustedCost = baseCost × (ikk / 100)`

### Coverage

- **38 provinces** (provinsi) — full national coverage
- **514 cities/kabupaten** — planned, city-level data pending seed

## Data Structure

### Province Table (`ikk_province`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `code` | TEXT | BPS province code (e.g., '1100' for Aceh) |
| `name` | TEXT | Province name in Indonesian |
| `name_en` | TEXT | Province name in English |
| `region` | TEXT | Region group (Sumatera, Jawa, etc.) |
| `ikk` | DECIMAL | IKK value for the year |
| `ranking` | INT | National ranking (1 = most expensive) |
| `reference_city` | TEXT | Reference city used for calculation |
| `year` | INT | Data year |
| `is_above_reference` | BOOLEAN | True if IKK > 100 |

### City Table (`ikk_city`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `province_code` | TEXT | FK to `ikk_province.code` |
| `code` | TEXT | BPS city code |
| `name` | TEXT | City/Kabupaten name |
| `ikk` | DECIMAL | IKK value |
| `ranking` | INT | Ranking within province |
| `year` | INT | Data year |

### Component Table (`ikk_component`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `location_code` | TEXT | Province or city code |
| `location_type` | TEXT | 'province' or 'city' |
| `component_type` | TEXT | 'material', 'equipment', 'labor', 'overhead', 'profit' |
| `name` | TEXT | Component name |
| `value` | DECIMAL | Component value/index |
| `weight` | DECIMAL | Weight in IKK calculation |
| `unit` | TEXT | Unit of measurement |
| `year` | INT | Data year |
| `quarter` | INT | Quarter (1-4) |

## API Reference

### GET /api/ikk

Query IKK data with flexible options.

**Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `type` | string | `province` | Query mode: `province`, `city`, `history`, `rankings`, `compare`, `calculate` |
| `year` | number | `2024` | Data year |
| `code` | string | — | Province/city BPS code |
| `region` | string | — | Region filter (Sumatera, Jawa, etc.) |
| `province_code` | string | — | Parent province code (required for `city` type) |
| `limit` | number | `38` | Max results for `rankings` |
| `order` | string | `desc` | Sort order: `asc` or `desc` |
| `codes` | string | — | Comma-separated codes for `compare` |
| `base_cost` | number | — | Base cost in IDR for `calculate` |
| `location_code` | string | — | Target location for `calculate` |

**Examples:**

```bash
# Get all provinces for 2024
GET /api/ikk?type=province&year=2024

# Get DKI Jakarta specifically
GET /api/ikk?type=province&year=2024&code=3100

# Get cities in South Sumatra
GET /api/ikk?type=city&year=2024&province_code=1600

# Get historical data for Aceh
GET /api/ikk?type=history&code=1100&year=2024

# Compare 3 provinces
GET /api/ikk?type=compare&codes=1100,3100,6400&year=2024

# Calculate adjusted cost
GET /api/ikk?type=calculate&base_cost=1000000000&location_code=3100&year=2024

# Get top 10 most expensive
GET /api/ikk?type=rankings&year=2024&limit=10&order=desc
```

**Response Format:**

```json
{
  "success": true,
  "data": {
    "provinces": [
      {
        "code": "3100",
        "name": "DKI Jakarta",
        "name_en": "Jakarta",
        "region": "Jawa",
        "ikk": 114.79,
        "ranking": 6,
        "reference_city": "Banjarmasin",
        "year": 2024,
        "is_above_reference": true
      }
    ]
  }
}
```

## SDK Usage

### IKKClient Methods

```typescript
import { IKKClient } from '@alvinahmad/blueprin-sdk/ikk';

const ikk = new IKKClient(sdk);

// Get all provinces
const provinces = await ikk.getProvinceIKK(2024);

// Get specific province
const aceh = await ikk.getProvinceIKK(2024, '1100');

// Get cities in a province
const cities = await ikk.getCityIKK(2024, '1600');

// Get historical data
const history = await ikk.getIKKHistory('1100', 'province', 2019, 2024);

// Compare locations
const comparison = await ikk.compareIKK(['1100', '3100', '6400'], 2024);

// Calculate adjusted cost
const estimate = await ikk.calculateCost(1000000000, '3100', 2024);
// { baseCost: 1000000000, adjustedCost: 1147900000, multiplier: 1.1479, ... }

// Get rankings
const rankings = await ikk.getIKKRankings(2024, 10, 'desc');

// Static helpers (no API call)
const allProvinces = ikk.getProvinceList();
const name = ikk.getProvinceName('1100'); // "Aceh"
const sumatera = ikk.getProvincesByRegion('Sumatera');
```

### TypeScript Types

All IKK types are exported from `@alvinahmad/blueprin-sdk`:

```typescript
import type {
  IKKProvince,
  IKKCity,
  IKKComponentDetail,
  IKKHistory,
  IKKComparison,
  IKKCostEstimate,
  IKKReferenceCity,
  IKKComponentType,
  IKKRegion,
} from '@alvinahmad/blueprin-sdk';

import { INDONESIA_PROVINCES } from '@alvinahmad/blueprin-sdk';
```

## Region Groups

Indonesia's 38 provinces are grouped into 6 regions:

| Region | Provinces | Examples |
|--------|-----------|----------|
| Sumatera | 10 | Aceh, North Sumatra, Riau, Jakarta |
| Jawa | 6 | DKI Jakarta, West Java, Central Java |
| Kalimantan | 5 | West Kalimantan, East Kalimantan |
| Sulawesi | 6 | North Sulawesi, South Sulawesi |
| Bali & Nusa Tenggara | 3 | Bali, West Nusa Tenggara |
| Maluku & Papua | 8 | Maluku, Papua, Highland Papua |

## Seeding Data

### Province Data

38 provinces with 2024 and 2023 data are seeded via `supabase/migration/ikk_construction_cost_index.sql`.

### City Data (Planned)

514 kabupaten/kota data needs to be sourced from BPS and seeded into the `ikk_city` table.

## Security

- **RLS Enabled**: All IKK tables have Row Level Security
- **Read Access**: All authenticated users can read IKK data
- **Write Access**: Only admin users (via `user_roles` table) can modify IKK data
- **Service Role**: API uses service role client for admin operations

## Contributing

When adding new IKK features:

1. **Types**: Add TypeScript interfaces to `blueprin-sdk/lib/src/types/index.ts`
2. **Client**: Extend `IKKClient` in `blueprin-sdk/lib/src/ikk/ikk-client.ts`
3. **API**: Add new query types to `src/app/api/ikk/route.js`
4. **UI**: Extend the dashboard at `src/app/home/ikk/page.jsx`
5. **Tests**: Add unit tests for new SDK methods
6. **Docs**: Update this file and SDK README

### Code Style

- All comments in English, contributor-friendly
- JSDoc for all public methods
- Consistent naming: `camelCase` for JS/TS, `snake_case` for DB columns
- Error handling: return empty arrays/null for failed requests (SDK), throw for API errors

## References

- [BPS IKK Publication](https://www.bps.go.id) — Official IKK data
- [IKK Methodology](https://www.bps.go.id/en/methodology/ikk) — How IKK is calculated
- [SDK README](../README.md) — Blueprin SDK documentation
