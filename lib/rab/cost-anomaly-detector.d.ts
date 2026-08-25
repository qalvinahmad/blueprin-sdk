/**
 * @alvinahmad/blueprin-sdk - CostAnomalyDetector
 *
 * Automated BOQ & RAB Cost Anomaly Detection Engine.
 * Transparent rule-based auditor for suspicious markups, PUPR benchmark outliers,
 * phantom/fictitious items, duplicate scopes, and mathematical mismatches.
 */
import type { AnomalySeverity, AnomalyFinding, AnomalySummary, BenchmarkPriceEntry, CostAnomalyOptions } from './cost-anomaly-types.js';
export declare const DEFAULT_FICTITIOUS_KEYWORDS: string[];
export declare const DEFAULT_BENCHMARK_PRICES: Record<string, BenchmarkPriceEntry>;
export declare const SEVERITY_META: Record<AnomalySeverity, {
    rank: number;
    label: string;
    color: string;
}>;
/**
 * Detects cost anomalies across a list of BOQ / RAB items.
 */
export declare function detectCostAnomalies(rabItems?: any[], options?: CostAnomalyOptions): AnomalyFinding[];
/**
 * Summarizes audit findings into aggregated counts and cost saving metrics.
 */
export declare function summarizeAnomalies(findings: AnomalyFinding[], totalItemsCount?: number): AnomalySummary;
/**
 * CostAnomalyDetector class for object-oriented usage and custom benchmark management.
 */
export declare class CostAnomalyDetector {
    private _options;
    constructor(options?: CostAnomalyOptions);
    /**
     * Run comprehensive cost anomaly audit on a set of RAB items.
     */
    audit(rabItems: any[]): {
        findings: AnomalyFinding[];
        summary: AnomalySummary;
    };
    /**
     * Add or override benchmark price reference entries.
     */
    setBenchmark(keyword: string, entry: BenchmarkPriceEntry): void;
    /**
     * Get all registered benchmark price keys.
     */
    getBenchmarkKeys(): string[];
}
