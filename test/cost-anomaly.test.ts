import { describe, it, expect, beforeEach } from 'vitest';
import { BlueprinSDK } from '../lib/src/core/sdk.ts';
import {
  CostAnomalyDetector,
  detectCostAnomalies,
  summarizeAnomalies,
  DEFAULT_BENCHMARK_PRICES,
} from '../lib/src/rab/index.ts';

describe('Cost Anomaly & BOQ Audit Engine Suite', () => {
  let sdk: BlueprinSDK;

  beforeEach(async () => {
    sdk = new BlueprinSDK({ appId: 'test-cost-anomaly' });
    await sdk.init();
  });

  describe('1. PUPR Benchmark Outliers & Price Markup Detection', () => {
    it('flags items with unit price >= 1.5x median market benchmark', () => {
      const items = [
        {
          id: 'item-1',
          uraian: 'Pekerjaan Pasang Keramik Lantai 60x60',
          satuan: 'm2',
          volume: 120,
          harga_satuan: 220000, // Benchmark median is 85,000 -> ratio ~2.58 (CRITICAL)
        },
        {
          id: 'item-2',
          uraian: 'Plesteran Dinding 1:4',
          satuan: 'm2',
          volume: 200,
          harga_satuan: 62000, // Benchmark median is 60,000 -> Normal
        },
      ];

      const findings = detectCostAnomalies(items);
      expect(findings.length).toBe(1);
      expect(findings[0].type).toBe('PRICE_MARKUP');
      expect(findings[0].severity).toBe('CRITICAL');
      expect(findings[0].savingPotential).toBeGreaterThan(0);
      expect(findings[0].benchmark?.median).toBe(85000);
    });

    it('flags items with suspiciously low unit prices', () => {
      const items = [
        {
          id: 'item-low',
          uraian: 'Cor Beton K300 Readymix',
          satuan: 'm3',
          volume: 25,
          harga_satuan: 500000, // Benchmark median is 1,400,000 -> ratio ~0.35 (LOW severity alert)
        },
      ];

      const findings = detectCostAnomalies(items);
      expect(findings.length).toBe(1);
      expect(findings[0].type).toBe('PRICE_TOO_LOW');
      expect(findings[0].severity).toBe('LOW');
      expect(findings[0].message).toContain('jauh di bawah median');
    });
  });

  describe('2. Phantom / Fictitious Item Detection', () => {
    it('flags red-flag keywords with high total values', () => {
      const items = [
        {
          id: 'item-phantom-1',
          uraian: 'Biaya Tambahan Operasional Lapangan Tak Terduga',
          satuan: 'ls',
          volume: 1,
          harga_satuan: 15000000,
        },
        {
          id: 'item-legit',
          uraian: 'Galian Tanah Pondasi',
          satuan: 'm3',
          volume: 40,
          harga_satuan: 95000,
        },
      ];

      const findings = detectCostAnomalies(items);
      const phantomFinding = findings.find((f) => f.type === 'PHANTOM_ITEM');
      expect(phantomFinding).toBeDefined();
      expect(phantomFinding?.severity).toBe('HIGH');
      expect(phantomFinding?.savingPotential).toBe(7500000);
    });
  });

  describe('3. Duplicate Code and Divergent Prices', () => {
    it('detects duplicate codes with more than 10% price variance', () => {
      const items = [
        {
          id: 'item-c1',
          kode: 'STR-01',
          uraian: 'Cor Kolom Praktis 15x15 Lt 1',
          satuan: 'm3',
          volume: 4,
          harga_satuan: 1200000,
        },
        {
          id: 'item-c2',
          kode: 'STR-01',
          uraian: 'Cor Kolom Praktis 15x15 Lt 2',
          satuan: 'm3',
          volume: 4,
          harga_satuan: 1650000, // >10% variance with same code
        },
      ];

      const findings = detectCostAnomalies(items);
      const dupFinding = findings.find((f) => f.type === 'DUPLICATE_CODE');
      expect(dupFinding).toBeDefined();
      expect(dupFinding?.affectedItems?.length).toBe(2);
      expect(dupFinding?.message).toContain('STR-01');
    });
  });

  describe('4. Internal Project Outliers & Arithmetic Mismatches', () => {
    it('identifies internal price outliers among identical item descriptions', () => {
      const items = [
        { id: '1', uraian: 'Pasang Pintu Kayu Solid Kamar', volume: 2, harga_satuan: 2500000 },
        { id: '2', uraian: 'Pasang Pintu Kayu Solid Kamar', volume: 2, harga_satuan: 2600000 },
        { id: '3', uraian: 'Pasang Pintu Kayu Solid Kamar', volume: 1, harga_satuan: 4800000 }, // Outlier within project
      ];

      const findings = detectCostAnomalies(items);
      const outlier = findings.find((f) => f.type === 'INTERNAL_OUTLIER');
      expect(outlier).toBeDefined();
      expect(outlier?.savingPotential).toBeGreaterThan(0);
    });

    it('identifies mathematical discrepancies between volume * unit_price and subtotal', () => {
      const items = [
        {
          id: 'item-calc-err',
          uraian: 'Pemasangan Plafon PVC Ruang Utama',
          satuan: 'm2',
          volume: 50,
          harga_satuan: 160000,
          subtotal: 10000000, // True calculation is 50 * 160,000 = 8,000,000 (Mismatch of 2,000,000)
        },
      ];

      const findings = detectCostAnomalies(items);
      const mathFinding = findings.find((f) => f.type === 'ARITHMETIC_MISMATCH');
      expect(mathFinding).toBeDefined();
      expect(mathFinding?.savingPotential).toBe(2000000);
    });
  });

  describe('5. Summary Roll-up & Risk Scoring', () => {
    it('summarizes findings into risk scores and total savings', () => {
      const findings = detectCostAnomalies([
        { id: '1', uraian: 'Pasang Keramik', volume: 100, harga_satuan: 250000 }, // CRITICAL Markup
        { id: '2', uraian: 'Biaya Tak Terduga', volume: 1, harga_satuan: 12000000 }, // HIGH Phantom
      ]);

      const summary = summarizeAnomalies(findings, 10);
      expect(summary.total).toBe(2);
      expect(summary.critical).toBe(1);
      expect(summary.high).toBe(1);
      expect(summary.totalSaving).toBeGreaterThan(0);
      expect(summary.riskScore).toBeGreaterThan(0);
      expect(summary.healthyItemsCount).toBe(8);
    });
  });

  describe('6. Object-Oriented CostAnomalyDetector & SDK Integration', () => {
    it('allows custom benchmarks and provides audit helpers on RabClient', async () => {
      const detector = new CostAnomalyDetector({
        customBenchmarks: {
          'cat epoxy lantai': { median: 120000, p25: 100000, p75: 150000, satuan: 'm2' },
        },
      });

      expect(detector.getBenchmarkKeys()).toContain('cat epoxy lantai');

      const auditRes = detector.audit([
        { id: 'e-1', uraian: 'Cat Epoxy Lantai Gudang', volume: 200, harga_satuan: 280000 },
      ]);

      expect(auditRes.findings.length).toBe(1);
      expect(auditRes.findings[0].type).toBe('PRICE_MARKUP');

      // Test RabClient integration
      await sdk.rab.addItem('proj-audit-test', {
        uraian: 'Pasang Dinding Bata Merah',
        volume: 50,
        harga_satuan: 350000, // Markup vs 145,000 benchmark
        satuan: 'm2',
      });

      let auditEmitted = false;
      sdk.events.on('blueprin:rab:audited', (data) => {
        if (data.projectId === 'proj-audit-test') auditEmitted = true;
      });

      const projectAudit = await sdk.rab.auditProject('proj-audit-test');
      expect(projectAudit.findings.length).toBe(1);
      expect(projectAudit.summary.total).toBe(1);
      expect(auditEmitted).toBe(true);
    });
  });
});
