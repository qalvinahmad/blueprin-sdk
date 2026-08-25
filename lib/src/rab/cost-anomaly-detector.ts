/**
 * @alvinahmad/blueprin-sdk - CostAnomalyDetector
 *
 * Automated BOQ & RAB Cost Anomaly Detection Engine.
 * Transparent rule-based auditor for suspicious markups, PUPR benchmark outliers,
 * phantom/fictitious items, duplicate scopes, and mathematical mismatches.
 */

import { formatIDR } from '../utils/index.js';
import type {
  AnomalySeverity,
  AnomalyType,
  AnomalyFinding,
  AnomalySummary,
  BenchmarkPriceEntry,
  CostAnomalyOptions,
} from './cost-anomaly-types.js';

export const DEFAULT_FICTITIOUS_KEYWORDS = [
  'tambahan',
  'lain-lain',
  'lainnya',
  'konsumsi',
  'operasional',
  'biaya umum',
  'overhead lain',
  'tak terduga',
  'darurat',
  'kebersihan kantor',
  'dokumentasi',
  'rapat',
  'biaya administrasi',
  'biaya tidak terduga',
];

export const DEFAULT_BENCHMARK_PRICES: Record<string, BenchmarkPriceEntry> = {
  'pasang keramik': { median: 85000, p25: 70000, p75: 110000, satuan: 'm2', source: 'PUPR/SNI' },
  'pasang granit': { median: 165000, p25: 140000, p75: 195000, satuan: 'm2', source: 'PUPR/SNI' },
  'pasang dinding bata merah': { median: 145000, p25: 125000, p75: 170000, satuan: 'm2', source: 'PUPR/SNI' },
  'pasang dinding bata ringan': { median: 165000, p25: 150000, p75: 190000, satuan: 'm2', source: 'PUPR/SNI' },
  'plesteran dinding': { median: 60000, p25: 50000, p75: 75000, satuan: 'm2', source: 'PUPR/SNI' },
  'acian dinding': { median: 35000, p25: 28000, p75: 45000, satuan: 'm2', source: 'PUPR/SNI' },
  'cor beton k225': { median: 1100000, p25: 950000, p75: 1300000, satuan: 'm3', source: 'PUPR/SNI' },
  'cor beton k250': { median: 1250000, p25: 1100000, p75: 1450000, satuan: 'm3', source: 'PUPR/SNI' },
  'cor beton k300': { median: 1400000, p25: 1250000, p75: 1600000, satuan: 'm3', source: 'PUPR/SNI' },
  'pekerjaan pondasi batu kali': { median: 950000, p25: 825000, p75: 1100000, satuan: 'm3', source: 'PUPR/SNI' },
  'galian tanah': { median: 95000, p25: 75000, p75: 125000, satuan: 'm3', source: 'PUPR/SNI' },
  'urugan tanah': { median: 85000, p25: 70000, p75: 110000, satuan: 'm3', source: 'PUPR/SNI' },
  'atap genteng beton': { median: 220000, p25: 180000, p75: 260000, satuan: 'm2', source: 'PUPR/SNI' },
  'atap genteng tanah liat': { median: 175000, p25: 145000, p75: 210000, satuan: 'm2', source: 'PUPR/SNI' },
  'atap spandek': { median: 145000, p25: 120000, p75: 180000, satuan: 'm2', source: 'PUPR/SNI' },
  'plafon gypsum': { median: 195000, p25: 165000, p75: 235000, satuan: 'm2', source: 'PUPR/SNI' },
  'plafon pvc': { median: 165000, p25: 140000, p75: 195000, satuan: 'm2', source: 'PUPR/SNI' },
  'cat tembok dalam': { median: 35000, p25: 28000, p75: 45000, satuan: 'm2', source: 'PUPR/SNI' },
  'cat tembok luar': { median: 45000, p25: 38000, p75: 58000, satuan: 'm2', source: 'PUPR/SNI' },
  'kusen kayu': { median: 1850000, p25: 1500000, p75: 2200000, satuan: 'm3', source: 'PUPR/SNI' },
  'kusen aluminium': { median: 425000, p25: 350000, p75: 525000, satuan: 'm', source: 'PUPR/SNI' },
  'pintu kayu solid': { median: 2750000, p25: 2200000, p75: 3500000, satuan: 'unit', source: 'PUPR/SNI' },
  'jendela aluminium': { median: 685000, p25: 550000, p75: 825000, satuan: 'm2', source: 'PUPR/SNI' },
  'instalasi listrik': { median: 245000, p25: 195000, p75: 295000, satuan: 'titik', source: 'PUPR/SNI' },
  'instalasi air bersih': { median: 185000, p25: 150000, p75: 225000, satuan: 'titik', source: 'PUPR/SNI' },
  'instalasi air kotor': { median: 195000, p25: 165000, p75: 240000, satuan: 'titik', source: 'PUPR/SNI' },
  'kloset duduk': { median: 1850000, p25: 150000, p75: 2350000, satuan: 'unit', source: 'PUPR/SNI' },
  'wastafel': { median: 1250000, p25: 950000, p75: 1650000, satuan: 'unit', source: 'PUPR/SNI' },
  'shower': { median: 750000, p25: 550000, p75: 950000, satuan: 'unit', source: 'PUPR/SNI' },
};

export const SEVERITY_META: Record<AnomalySeverity, { rank: number; label: string; color: string }> = {
  LOW: { rank: 1, label: 'Rendah', color: 'amber' },
  MEDIUM: { rank: 2, label: 'Sedang', color: 'orange' },
  HIGH: { rank: 3, label: 'Tinggi', color: 'rose' },
  CRITICAL: { rank: 4, label: 'Kritis', color: 'red' },
};

function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function findMatchingBenchmark(
  uraian: string,
  catalog: Record<string, BenchmarkPriceEntry>
): (BenchmarkPriceEntry & { keyword: string }) | null {
  const text = String(uraian || '').toLowerCase().trim();
  if (!text) return null;

  let bestMatch: (BenchmarkPriceEntry & { keyword: string }) | null = null;
  let bestScore = 0;

  for (const [keyword, ref] of Object.entries(catalog)) {
    if (text.includes(keyword.toLowerCase())) {
      const score = keyword.length;
      if (score > bestScore) {
        bestMatch = { keyword, ...ref };
        bestScore = score;
      }
    }
  }

  return bestMatch;
}

/**
 * Detects cost anomalies across a list of BOQ / RAB items.
 */
export function detectCostAnomalies(
  rabItems: any[] = [],
  options: CostAnomalyOptions = {}
): AnomalyFinding[] {
  const findings: AnomalyFinding[] = [];
  if (!rabItems || rabItems.length === 0) return findings;

  const benchmarkCatalog = {
    ...DEFAULT_BENCHMARK_PRICES,
    ...(options.customBenchmarks || {}),
  };

  const markupThreshold = options.markupThreshold ?? 1.5;
  const lowPriceThreshold = options.lowPriceThreshold ?? 0.55;
  const fictitiousKeywords = options.fictitiousKeywords ?? DEFAULT_FICTITIOUS_KEYWORDS;

  // Build internal grouped maps
  const byUraian = new Map<string, { item: any; price: number }[]>();
  const byCode = new Map<string, any[]>();
  let suspiciousRoundCount = 0;

  rabItems.forEach((item, index) => {
    const rawId = item.id || `item-${index + 1}`;
    const name = String(item.uraian || item.description || item.work_name || item.nama_item || '').trim();
    const code = String(item.code || item.kode || '').trim().toUpperCase();
    const unit = item.unit || item.satuan || 'unit';
    const volume = Number(item.volume) || 0;
    const unitPrice = Number(item.unit_price || item.harga_satuan || item.hargaSatuan) || 0;
    const statedSubtotal = Number(item.subtotal || item.total_price || item.totalHarga) || 0;

    const normalizedItem = {
      ...item,
      id: rawId,
      uraian: name,
      kode: code,
      satuan: unit,
      volume,
      harga_satuan: unitPrice,
    };

    // 1. Check Arithmetic Mismatch
    if (volume > 0 && unitPrice > 0 && statedSubtotal > 0) {
      const calculated = volume * unitPrice;
      if (Math.abs(calculated - statedSubtotal) > 100) {
        findings.push({
          id: `arithmetic-${rawId}`,
          severity: 'HIGH',
          type: 'ARITHMETIC_MISMATCH',
          item: normalizedItem,
          message: `Kalkulasi subtotal untuk "${name}" tidak cocok. (Volume ${volume} × Harga Satuan ${formatIDR(unitPrice)} = ${formatIDR(calculated)}, tercatat ${formatIDR(statedSubtotal)}).`,
          recommendation: 'Hitung ulang subtotal baris item secara otomatis.',
          savingPotential: Math.max(0, statedSubtotal - calculated),
        });
      }
    }

    // 2. Check Price vs PUPR / SNI Benchmark
    if (unitPrice > 0) {
      const benchmark = findMatchingBenchmark(name, benchmarkCatalog);
      if (benchmark) {
        const ratio = unitPrice / benchmark.median;
        if (ratio >= markupThreshold) {
          const savingPerUnit = unitPrice - benchmark.median;
          const totalSaving = savingPerUnit * volume;
          findings.push({
            id: `markup-${rawId}`,
            severity: ratio >= 2.5 ? 'CRITICAL' : ratio >= 2.0 ? 'HIGH' : 'MEDIUM',
            type: 'PRICE_MARKUP',
            item: normalizedItem,
            message: `Harga "${name}" ${formatIDR(unitPrice)}/${unit} terlalu tinggi — rata-rata standar pasar/PUPR ${formatIDR(benchmark.median)}/${benchmark.satuan} (${Math.round((ratio - 1) * 100)}% di atas median).`,
            recommendation: `Negosiasikan ke kisaran ${formatIDR(benchmark.p25)}–${formatIDR(benchmark.p75)}/${benchmark.satuan}. Bandingkan minimal 3 supplier.`,
            savingPotential: Math.max(0, totalSaving),
            benchmark,
            ratio,
          });
        } else if (ratio <= lowPriceThreshold) {
          findings.push({
            id: `low-price-${rawId}`,
            severity: 'LOW',
            type: 'PRICE_TOO_LOW',
            item: normalizedItem,
            message: `Harga "${name}" ${formatIDR(unitPrice)}/${unit} jauh di bawah median pasar (${formatIDR(benchmark.median)}/${benchmark.satuan}). Verifikasi spesifikasi material agar kualitas tidak dikurangi.`,
            recommendation: 'Pastikan spesifikasi teknis dan kelas material sesuai standar kontrak.',
            benchmark,
            ratio,
          });
        }
      }
    }

    // 3. Check Phantom / Fictitious items
    const lowerName = name.toLowerCase();
    const matchedKw = fictitiousKeywords.find((kw) => lowerName.includes(kw.toLowerCase()));
    const totalItemCost = volume * unitPrice;
    if (matchedKw && totalItemCost >= 1000000) {
      findings.push({
        id: `phantom-${rawId}`,
        severity: totalItemCost >= 10000000 ? 'HIGH' : 'MEDIUM',
        type: 'PHANTOM_ITEM',
        item: normalizedItem,
        message: `Item "${name}" memuat kata "${matchedKw}" dengan total nilai ${formatIDR(totalItemCost)} — indikasi pos anggaran fiktif atau biaya umum yang sulit diaudit.`,
        recommendation: 'Minta rincian breakdown per komponen atau batasi biaya umum maksimal 2-5% dari RAB.',
        savingPotential: totalItemCost * 0.5,
      });
    }

    // 4. Track Round Number Bias
    if (totalItemCost >= 5000000 && totalItemCost % 1000000 === 0) {
      suspiciousRoundCount++;
    }

    // Track for internal group checks
    if (name && unitPrice > 0) {
      const groupKey = name.toLowerCase();
      if (!byUraian.has(groupKey)) byUraian.set(groupKey, []);
      byUraian.get(groupKey)!.push({ item: normalizedItem, price: unitPrice });
    }

    if (code && code !== '-') {
      if (!byCode.has(code)) byCode.set(code, []);
      byCode.get(code)!.push(normalizedItem);
    }
  });

  // 5. Check Duplicate Codes with Divergent Prices
  byCode.forEach((items, code) => {
    if (items.length < 2) return;
    const prices = items.map((i) => i.harga_satuan).filter((p) => p > 0);
    if (prices.length < 2) return;
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    if (maxP > 0 && (maxP - minP) / maxP > 0.1) {
      findings.push({
        id: `dup-code-${code}`,
        severity: 'MEDIUM',
        type: 'DUPLICATE_CODE',
        item: items[0],
        affectedItems: items,
        message: `Kode item "${code}" digunakan ${items.length} kali dengan harga satuan berbeda (${formatIDR(minP)} s/d ${formatIDR(maxP)}).`,
        recommendation: 'Standarkan harga satuan untuk kode yang sama, atau berikan kode unik jika spesifikasinya berbeda.',
      });
    }
  });

  // 6. Check Internal Outliers
  byUraian.forEach((entries, uraian) => {
    if (entries.length < 3) return;
    const prices = entries.map((e) => e.price);
    const med = calculateMedian(prices);
    const max = Math.max(...prices);
    const outlierEntry = entries.find((e) => e.price === max);
    if (outlierEntry && max > med * 1.5) {
      findings.push({
        id: `internal-outlier-${outlierEntry.item.id}`,
        severity: max > med * 2 ? 'HIGH' : 'MEDIUM',
        type: 'INTERNAL_OUTLIER',
        item: outlierEntry.item,
        message: `Harga "${outlierEntry.item.uraian}" pada baris ini (${formatIDR(max)}) terpaut ${Math.round((max / med - 1) * 100)}% di atas median proyek (${formatIDR(med)}) untuk item sejenis.`,
        recommendation: 'Sesuaikan harga satuan dengan baris pekerjaan serupa lainnya dalam proyek ini.',
        savingPotential: (max - med) * (outlierEntry.item.volume || 1),
      });
    }
  });

  // 7. Check Round Number Bias Threshold
  if (suspiciousRoundCount >= (options.roundNumberThreshold ?? 5)) {
    findings.push({
      id: 'round-number-bias',
      severity: 'LOW',
      type: 'ROUND_NUMBER_BIAS',
      message: `Ditemukan ${suspiciousRoundCount} item dengan total harga angka bulat kelipatan Rp 1.000.000. Ini mengindikasikan estimasi gelondongan tanpa kalkulasi volume detail.`,
      recommendation: 'Lakukan perhitungan quantity takeoff dan AHS detail per sub-item.',
    });
  }

  // Sort findings by severity rank desc, then saving potential desc
  findings.sort((a, b) => {
    const rankA = SEVERITY_META[a.severity]?.rank || 0;
    const rankB = SEVERITY_META[b.severity]?.rank || 0;
    if (rankB !== rankA) return rankB - rankA;
    return (b.savingPotential || 0) - (a.savingPotential || 0);
  });

  return findings;
}

/**
 * Summarizes audit findings into aggregated counts and cost saving metrics.
 */
export function summarizeAnomalies(
  findings: AnomalyFinding[],
  totalItemsCount: number = 0
): AnomalySummary {
  const total = findings.length;
  const critical = findings.filter((f) => f.severity === 'CRITICAL').length;
  const high = findings.filter((f) => f.severity === 'HIGH').length;
  const medium = findings.filter((f) => f.severity === 'MEDIUM').length;
  const low = findings.filter((f) => f.severity === 'LOW').length;
  const totalSaving = findings.reduce((sum, f) => sum + (f.savingPotential || 0), 0);

  const healthyItemsCount = Math.max(0, totalItemsCount - total);
  const riskScore = Math.min(100, Math.round(critical * 30 + high * 15 + medium * 5 + low * 2));

  return {
    total,
    critical,
    high,
    medium,
    low,
    totalSaving,
    healthyItemsCount,
    riskScore,
  };
}

/**
 * CostAnomalyDetector class for object-oriented usage and custom benchmark management.
 */
export class CostAnomalyDetector {
  private _options: CostAnomalyOptions;

  constructor(options: CostAnomalyOptions = {}) {
    this._options = options;
  }

  /**
   * Run comprehensive cost anomaly audit on a set of RAB items.
   */
  audit(rabItems: any[]): { findings: AnomalyFinding[]; summary: AnomalySummary } {
    const findings = detectCostAnomalies(rabItems, this._options);
    const summary = summarizeAnomalies(findings, rabItems.length);
    return { findings, summary };
  }

  /**
   * Add or override benchmark price reference entries.
   */
  setBenchmark(keyword: string, entry: BenchmarkPriceEntry): void {
    if (!this._options.customBenchmarks) {
      this._options.customBenchmarks = {};
    }
    this._options.customBenchmarks[keyword.toLowerCase()] = entry;
  }

  /**
   * Get all registered benchmark price keys.
   */
  getBenchmarkKeys(): string[] {
    return Object.keys({
      ...DEFAULT_BENCHMARK_PRICES,
      ...(this._options.customBenchmarks || {}),
    });
  }
}
