/**
 * @alvinahmad/blueprin-sdk - Cost Anomaly & BOQ Audit Types
 *
 * Types for automated budget audit, benchmark outlier detection (PUPR / market median),
 * duplicate scope identification, and cost saving recommendations.
 */
export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AnomalyType = 'PRICE_MARKUP' | 'PRICE_TOO_LOW' | 'PHANTOM_ITEM' | 'DUPLICATE_CODE' | 'DUPLICATE_SCOPE' | 'INTERNAL_OUTLIER' | 'ROUND_NUMBER_BIAS' | 'ARITHMETIC_MISMATCH';
export interface BenchmarkPriceEntry {
    median: number;
    p25: number;
    p75: number;
    satuan: string;
    source?: string;
}
export interface AnomalyFinding {
    id: string;
    severity: AnomalySeverity;
    type: AnomalyType;
    item?: any;
    affectedItems?: any[];
    message: string;
    recommendation: string;
    savingPotential?: number;
    ratio?: number;
    benchmark?: BenchmarkPriceEntry & {
        keyword: string;
    };
}
export interface AnomalySummary {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    totalSaving: number;
    healthyItemsCount?: number;
    riskScore?: number;
}
export interface CostAnomalyOptions {
    customBenchmarks?: Record<string, BenchmarkPriceEntry>;
    markupThreshold?: number;
    lowPriceThreshold?: number;
    fictitiousKeywords?: string[];
    roundNumberThreshold?: number;
}
