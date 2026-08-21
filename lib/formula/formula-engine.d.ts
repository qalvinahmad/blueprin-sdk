/**
 * Formula Engine — Pipeline for construction cost calculations.
 *
 * Supports: coefficient, escalation, allowance, overhead, profit, tax.
 * Designed for budget plan (RAB - Rencana Anggaran Biaya) workflows.
 *
 * Pipeline:
 *   baseCost → coefficient → escalation → subtotal
 *   → overhead → profit → tax → grandTotal
 *
 * Each step is pluggable and can be extended by plugins via hooks.
 */
export interface CostComponent {
    id: string;
    name: string;
    category: 'MATERIAL' | 'UPAH' | 'ALAT' | 'OTHER';
    quantity: number;
    unit: string;
    unitPrice: number;
    coefficient?: number;
    subtotal?: number;
}
export interface FormulaContext {
    components: CostComponent[];
    coefficients: CostCoefficients;
    escalation: EscalationConfig;
    overhead: OverheadConfig;
    profit: ProfitConfig;
    tax: TaxConfig;
    region?: string;
    projectName?: string;
}
export interface CostCoefficients {
    material: number;
    labor: number;
    equipment: number;
    other: number;
}
export interface EscalationConfig {
    annualRate: number;
    months: number;
}
export interface OverheadConfig {
    percentage: number;
    amount?: number;
}
export interface ProfitConfig {
    percentage: number;
}
export interface TaxConfig {
    ppnRate: number;
    pphRate: number;
}
export interface FormulaResult {
    items: CostComponent[];
    subtotal: number;
    overheadTotal: number;
    profitTotal: number;
    ppnTotal: number;
    pphTotal: number;
    grandTotal: number;
    breakdown: {
        material: number;
        labor: number;
        equipment: number;
        other: number;
    };
    metadata: Record<string, any>;
}
export interface FormulaPipeline {
    name: string;
    execute: (context: FormulaContext) => FormulaResult;
}
export declare class FormulaEngine {
    private _pipelines;
    private _hooks;
    private _logger;
    constructor({ hooks, logger }?: {
        hooks?: any;
        logger?: any;
    });
    private _registerDefaultPipelines;
    register(name: string, pipeline: FormulaPipeline): void;
    get(name: string): FormulaPipeline | undefined;
    list(): string[];
    /**
     * Calculate using a named pipeline.
     */
    calculate(pipelineName: string, context: FormulaContext): FormulaResult;
    /**
     * Quick calculate with defaults.
     */
    quickCalculate(components: CostComponent[], options?: Partial<FormulaContext>): FormulaResult;
    private _standardPipeline;
    private _simplePipeline;
    private _getCoefficient;
    private _calculateEscalation;
    /**
     * Build a FormulaContext from a unit price analysis catalog entry.
     */
    static fromAhsEntry(ahsEntry: any, options?: Partial<FormulaContext>): FormulaContext;
    /**
     * Normalize category from various DB spellings to canonical form.
     */
    static normalizeCategory(raw: string): 'MATERIAL' | 'UPAH' | 'ALAT' | 'OTHER';
}
