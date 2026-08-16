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

const DEFAULT_COEFFICIENTS: CostCoefficients = {
  material: 1.0,
  labor: 1.0,
  equipment: 1.0,
  other: 1.0,
};

const DEFAULT_ESCALATION: EscalationConfig = {
  annualRate: 0,
  months: 0,
};

const DEFAULT_OVERHEAD: OverheadConfig = {
  percentage: 0,
};

const DEFAULT_PROFIT: ProfitConfig = {
  percentage: 0,
};

const DEFAULT_TAX: TaxConfig = {
  ppnRate: 0.12,
  pphRate: 0.0,
};

export class FormulaEngine {
  private _pipelines: Map<string, FormulaPipeline>;
  private _hooks: any;
  private _logger: any;

  constructor({ hooks, logger }: { hooks?: any; logger?: any } = {}) {
    this._pipelines = new Map();
    this._hooks = hooks;
    this._logger = logger;

    this._registerDefaultPipelines();
  }

  private _registerDefaultPipelines() {
    this.register('standard', {
      name: 'Standard RAB Pipeline',
      execute: (ctx) => this._standardPipeline(ctx),
    });

    this.register('simple', {
      name: 'Simple Cost Calculation',
      execute: (ctx) => this._simplePipeline(ctx),
    });
  }

  register(name: string, pipeline: FormulaPipeline) {
    this._pipelines.set(name, pipeline);
    this._logger?.debug?.(`Pipeline "${name}" registered`);
  }

  get(name: string): FormulaPipeline | undefined {
    return this._pipelines.get(name);
  }

  list(): string[] {
    return Array.from(this._pipelines.keys());
  }

  /**
   * Calculate using a named pipeline.
   */
  calculate(pipelineName: string, context: FormulaContext): FormulaResult {
    const pipeline = this._pipelines.get(pipelineName);
    if (!pipeline) {
      throw new Error(`Pipeline "${pipelineName}" not found. Available: ${this.list().join(', ')}`);
    }

    this._logger?.info?.(`Calculating with pipeline "${pipelineName}"`);
    const result = pipeline.execute(context);

    this._logger?.debug?.('Calculation result:', {
      subtotal: result.subtotal,
      grandTotal: result.grandTotal,
      itemCount: result.items.length,
    });

    return result;
  }

  /**
   * Quick calculate with defaults.
   */
  quickCalculate(components: CostComponent[], options: Partial<FormulaContext> = {}): FormulaResult {
    return this.calculate('standard', {
      components,
      coefficients: options.coefficients || DEFAULT_COEFFICIENTS,
      escalation: options.escalation || DEFAULT_ESCALATION,
      overhead: options.overhead || DEFAULT_OVERHEAD,
      profit: options.profit || DEFAULT_PROFIT,
      tax: options.tax || DEFAULT_TAX,
      region: options.region,
      projectName: options.projectName,
    });
  }

  // ── Standard Pipeline ──────────────────────────────────────

  private _standardPipeline(ctx: FormulaContext): FormulaResult {
    const items = ctx.components.map((comp) => {
      const coeff = this._getCoefficient(comp, ctx.coefficients);
      const base = comp.quantity * comp.unitPrice;
      const subtotal = base * coeff;

      return {
        ...comp,
        coefficient: coeff,
        subtotal: Math.round(subtotal),
      };
    });

    // Step 1: Subtotal
    const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

    // Step 2: Escalation (inflation adjustment)
    const escalationMultiplier = this._calculateEscalation(ctx.escalation);
    const escalatedSubtotal = Math.round(subtotal * escalationMultiplier);

    // Step 3: Overhead
    const overheadTotal = Math.round(
      escalatedSubtotal * (ctx.overhead.percentage / 100) + (ctx.overhead.amount || 0)
    );

    // Step 4: Profit
    const afterOverhead = escalatedSubtotal + overheadTotal;
    const profitTotal = Math.round(afterOverhead * (ctx.profit.percentage / 100));

    // Step 5: Tax (PPN - PPh)
    const taxableAmount = afterOverhead + profitTotal;
    const ppnTotal = Math.round(taxableAmount * ctx.tax.ppnRate);
    const pphTotal = Math.round(taxableAmount * ctx.tax.pphRate);

    // Grand Total
    const grandTotal = taxableAmount + ppnTotal - pphTotal;

    // Breakdown by category
    const breakdown = {
      material: items.filter((i) => i.category === 'MATERIAL').reduce((s, i) => s + (i.subtotal || 0), 0),
      labor: items.filter((i) => i.category === 'UPAH').reduce((s, i) => s + (i.subtotal || 0), 0),
      equipment: items.filter((i) => i.category === 'ALAT').reduce((s, i) => s + (i.subtotal || 0), 0),
      other: items.filter((i) => i.category === 'OTHER').reduce((s, i) => s + (i.subtotal || 0), 0),
    };

    return {
      items,
      subtotal: Math.round(subtotal),
      overheadTotal,
      profitTotal,
      ppnTotal,
      pphTotal,
      grandTotal: Math.round(grandTotal),
      breakdown,
      metadata: {
        pipeline: 'standard',
        escalationMultiplier,
        region: ctx.region,
        projectName: ctx.projectName,
        calculatedAt: new Date().toISOString(),
      },
    };
  }

  // ── Simple Pipeline ────────────────────────────────────────

  private _simplePipeline(ctx: FormulaContext): FormulaResult {
    const items = ctx.components.map((comp) => {
      const subtotal = comp.quantity * comp.unitPrice;
      return { ...comp, coefficient: 1, subtotal: Math.round(subtotal) };
    });

    const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const overheadTotal = Math.round(subtotal * (ctx.overhead.percentage / 100));
    const profitTotal = Math.round((subtotal + overheadTotal) * (ctx.profit.percentage / 100));
    const ppnTotal = Math.round((subtotal + overheadTotal + profitTotal) * ctx.tax.ppnRate);
    const grandTotal = subtotal + overheadTotal + profitTotal + ppnTotal;

    const breakdown = {
      material: items.filter((i) => i.category === 'MATERIAL').reduce((s, i) => s + (i.subtotal || 0), 0),
      labor: items.filter((i) => i.category === 'UPAH').reduce((s, i) => s + (i.subtotal || 0), 0),
      equipment: items.filter((i) => i.category === 'ALAT').reduce((s, i) => s + (i.subtotal || 0), 0),
      other: items.filter((i) => i.category === 'OTHER').reduce((s, i) => s + (i.subtotal || 0), 0),
    };

    return {
      items,
      subtotal: Math.round(subtotal),
      overheadTotal,
      profitTotal,
      ppnTotal: Math.round(ppnTotal),
      pphTotal: 0,
      grandTotal: Math.round(grandTotal),
      breakdown,
      metadata: {
        pipeline: 'simple',
        region: ctx.region,
        projectName: ctx.projectName,
        calculatedAt: new Date().toISOString(),
      },
    };
  }

  // ── Helpers ────────────────────────────────────────────────

  private _getCoefficient(comp: CostComponent, coefficients: CostCoefficients): number {
    switch (comp.category) {
      case 'MATERIAL': return comp.coefficient || coefficients.material;
      case 'UPAH': return comp.coefficient || coefficients.labor;
      case 'ALAT': return comp.coefficient || coefficients.equipment;
      default: return comp.coefficient || coefficients.other;
    }
  }

  private _calculateEscalation(config: EscalationConfig): number {
    if (!config.annualRate || !config.months) return 1;
    const monthlyRate = config.annualRate / 12 / 100;
    return Math.pow(1 + monthlyRate, config.months);
  }

  /**
   * Build a FormulaContext from a unit price analysis catalog entry.
   */
  static fromAhsEntry(ahsEntry: any, options: Partial<FormulaContext> = {}): FormulaContext {
    const components: CostComponent[] = (ahsEntry.components || []).map((c: any) => ({
      id: c.material_id || c.detail_id || `comp-${Math.random().toString(36).slice(2)}`,
      name: c.nama || c.komponen || 'Unknown',
      category: FormulaEngine.normalizeCategory(c.kategori),
      quantity: c.koefisien || 1,
      unit: c.satuan || 'unit',
      unitPrice: c.harga_satuan || c.hargaSatuan || 0,
      coefficient: c.koefisien,
    }));

    return {
      components,
      coefficients: options.coefficients || DEFAULT_COEFFICIENTS,
      escalation: options.escalation || DEFAULT_ESCALATION,
      overhead: options.overhead || DEFAULT_OVERHEAD,
      profit: options.profit || DEFAULT_PROFIT,
      tax: options.tax || DEFAULT_TAX,
      region: options.region,
      projectName: options.projectName,
    };
  }

  /**
   * Normalize category from various DB spellings to canonical form.
   */
  static normalizeCategory(raw: string): 'MATERIAL' | 'UPAH' | 'ALAT' | 'OTHER' {
    const k = String(raw || '').toUpperCase();
    if (k === 'BAHAN' || k === 'MATERIAL') return 'MATERIAL';
    if (['UPAH', 'TENAGA', 'TENAGA_KERJA', 'KERJA', 'PEKERJA', 'JASA', 'LABOR'].includes(k)) return 'UPAH';
    if (['ALAT', 'PERALATAN', 'TOOL', 'TOOLS'].includes(k)) return 'ALAT';
    return 'OTHER';
  }
}
