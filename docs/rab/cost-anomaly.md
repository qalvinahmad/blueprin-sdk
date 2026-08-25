# Cost Anomaly & BOQ Audit Engine (`@alvinahmad/blueprin-sdk/rab`)

The Cost Anomaly & BOQ Audit module provides a transparent, rule-based auditing engine to detect suspicious cost markups, PUPR/SNI benchmark outliers, phantom line items, duplicate item codes with price variance, and arithmetic errors in construction budgets.

---

## Features

- **PUPR & SNI Benchmark Outlier Detection**: Compares unit prices against standard market median distributions (25th percentile, median, 75th percentile).
- **Phantom / Fictitious Item Flagging**: Identifies vague high-value line items containing risky keywords (e.g. *tambahan*, *biaya umum*, *overhead lain*, *tak terduga*) that are difficult to audit.
- **Duplicate Code & Scope Discrepancies**: Detects line items sharing the same classification code but priced with significant variance (>10%).
- **Internal Project Outliers**: Flags items whose unit prices deviate significantly (>50%) from the median price of similar items within the same project.
- **Arithmetic Verification**: Checks volume multiplied by unit price against declared subtotal fields to catch rounding or calculation bugs.
- **Severity Ranking & Savings Estimation**: Classifies findings into `CRITICAL`, `HIGH`, `MEDIUM`, and `LOW` severities with potential cost saving calculations and actionable negotiation recommendations.

---

## Quick Start

```ts
import { BlueprinSDK, detectCostAnomalies, summarizeAnomalies } from '@alvinahmad/blueprin-sdk';

const sdk = new BlueprinSDK({ appId: 'cost-audit-app' });
await sdk.init();

// 1. Audit an existing project in storage
const { findings, summary } = await sdk.rab.auditProject('proj-123');

console.log(`Found ${summary.total} anomalies! Potential savings: ${summary.totalSaving}`);
findings.forEach((finding) => {
  console.log(`[${finding.severity}] ${finding.message}`);
  console.log(`Recommendation: ${finding.recommendation}`);
});

// 2. Direct in-memory auditing
const rawItems = [
  { id: '1', uraian: 'Pasang Keramik 60x60', volume: 100, harga_satuan: 250000, satuan: 'm2' },
  { id: '2', uraian: 'Biaya Tak Terduga Lapangan', volume: 1, harga_satuan: 10000000, satuan: 'ls' },
];

const auditResult = sdk.rab.detectAnomalies(rawItems);
console.log(auditResult.summary);
```

---

## Custom Benchmarks

Extend the built-in catalog with regional contractor or enterprise price books:

```ts
import { CostAnomalyDetector } from '@alvinahmad/blueprin-sdk';

const detector = new CostAnomalyDetector({
  markupThreshold: 1.4, // Flag if >=40% above median
  customBenchmarks: {
    'cat epoxy lantai': {
      median: 120000,
      p25: 100000,
      p75: 150000,
      satuan: 'm2',
      source: 'Internal 2026 Pricebook',
    },
  },
});

const { findings, summary } = detector.audit(rawItems);
```

---

## API Reference

### `detectCostAnomalies(items, options?)`

Audits an array of BOQ line items and returns an array of `AnomalyFinding` objects sorted by severity and saving potential.

### `summarizeAnomalies(findings, totalItemsCount?)`

Generates an aggregated `AnomalySummary` containing counts per severity tier, total saving potential, and a 0–100 risk score.

### `sdk.rab.auditProject(projectId, options?)`

Fetches items for `projectId` from storage, runs anomaly detection, emits `blueprin:rab:audited` event, and returns `{ findings, summary }`.
