import { describe, it, expect, vi } from 'vitest';
import { FormulaEngine, CostComponent, FormulaContext } from '../lib/src/formula/index.ts';

describe('FormulaEngine', () => {
  it('registers and lists default pipelines', () => {
    const engine = new FormulaEngine();
    const list = engine.list();
    expect(list).toContain('standard');
    expect(list).toContain('simple');
    expect(engine.get('standard')?.name).toBe('Standard RAB Pipeline');
    expect(engine.get('simple')?.name).toBe('Simple Cost Calculation');
  });

  it('allows registering custom pipeline and logging debug', () => {
    const mockLogger = { debug: vi.fn(), info: vi.fn() };
    const engine = new FormulaEngine({ logger: mockLogger });
    engine.register('custom', {
      name: 'Custom Pipeline',
      execute: (ctx) => ({
        items: ctx.components,
        subtotal: 1000,
        overheadTotal: 100,
        profitTotal: 50,
        ppnTotal: 110,
        pphTotal: 0,
        grandTotal: 1260,
        breakdown: { material: 1000, labor: 0, equipment: 0, other: 0 },
        metadata: { custom: true },
      }),
    });

    expect(engine.list()).toContain('custom');
    expect(mockLogger.debug).toHaveBeenCalledWith('Pipeline "custom" registered');

    const result = engine.calculate('custom', {
      components: [],
      coefficients: { material: 1, labor: 1, equipment: 1, other: 1 },
      escalation: { annualRate: 0, months: 0 },
      overhead: { percentage: 0 },
      profit: { percentage: 0 },
      tax: { ppnRate: 0.12, pphRate: 0 },
    });
    expect(result.grandTotal).toBe(1260);
    expect(mockLogger.info).toHaveBeenCalledWith('Calculating with pipeline "custom"');
  });

  it('throws when calculating with unknown pipeline', () => {
    const engine = new FormulaEngine();
    expect(() =>
      engine.calculate('non-existent', {
        components: [],
        coefficients: { material: 1, labor: 1, equipment: 1, other: 1 },
        escalation: { annualRate: 0, months: 0 },
        overhead: { percentage: 0 },
        profit: { percentage: 0 },
        tax: { ppnRate: 0.12, pphRate: 0 },
      })
    ).toThrow('Pipeline "non-existent" not found');
  });

  it('runs standard pipeline with coefficients, escalation, overhead, profit, and taxes', () => {
    const engine = new FormulaEngine();
    const components: CostComponent[] = [
      { id: '1', name: 'Semen', category: 'MATERIAL', quantity: 10, unit: 'sak', unitPrice: 50000 },
      { id: '2', name: 'Tukang', category: 'UPAH', quantity: 2, unit: 'oh', unitPrice: 150000 },
      { id: '3', name: 'Molen', category: 'ALAT', quantity: 1, unit: 'hari', unitPrice: 200000 },
      { id: '4', name: 'Lainnya', category: 'OTHER', quantity: 1, unit: 'ls', unitPrice: 50000, coefficient: 1.2 },
    ];

    const context: FormulaContext = {
      components,
      coefficients: {
        material: 1.05,
        labor: 1.1,
        equipment: 1.0,
        other: 1.0,
      },
      escalation: {
        annualRate: 6, // 6% per year
        months: 12,
      },
      overhead: {
        percentage: 5,
        amount: 25000,
      },
      profit: {
        percentage: 10,
      },
      tax: {
        ppnRate: 0.12,
        pphRate: 0.02,
      },
      region: 'Jakarta',
      projectName: 'Proyek Rumah',
    };

    const result = engine.calculate('standard', context);
    expect(result.items.length).toBe(4);
    expect(result.subtotal).toBeGreaterThan(0);
    expect(result.overheadTotal).toBeGreaterThan(0);
    expect(result.profitTotal).toBeGreaterThan(0);
    expect(result.ppnTotal).toBeGreaterThan(0);
    expect(result.pphTotal).toBeGreaterThan(0);
    expect(result.grandTotal).toBeGreaterThan(result.subtotal);
    expect(result.breakdown.material).toBeGreaterThan(0);
    expect(result.breakdown.labor).toBeGreaterThan(0);
    expect(result.breakdown.equipment).toBeGreaterThan(0);
    expect(result.breakdown.other).toBeGreaterThan(0);
    expect(result.metadata.region).toBe('Jakarta');
    expect(result.metadata.projectName).toBe('Proyek Rumah');
  });

  it('runs simple pipeline correctly', () => {
    const engine = new FormulaEngine();
    const components: CostComponent[] = [
      { id: '1', name: 'Bahan A', category: 'MATERIAL', quantity: 2, unit: 'm3', unitPrice: 100000 },
      { id: '2', name: 'Pekerja B', category: 'UPAH', quantity: 1, unit: 'hari', unitPrice: 100000 },
      { id: '3', name: 'Alat C', category: 'ALAT', quantity: 1, unit: 'unit', unitPrice: 50000 },
      { id: '4', name: 'Lain D', category: 'OTHER', quantity: 1, unit: 'ls', unitPrice: 20000 },
    ];

    const result = engine.calculate('simple', {
      components,
      coefficients: { material: 1, labor: 1, equipment: 1, other: 1 },
      escalation: { annualRate: 0, months: 0 },
      overhead: { percentage: 10 },
      profit: { percentage: 5 },
      tax: { ppnRate: 0.11, pphRate: 0 },
    });

    expect(result.subtotal).toBe(370000);
    expect(result.overheadTotal).toBe(37000);
    expect(result.profitTotal).toBe(Math.round(407000 * 0.05));
    expect(result.grandTotal).toBeGreaterThan(370000);
    expect(result.metadata.pipeline).toBe('simple');
  });

  it('quickCalculate uses sensible defaults', () => {
    const engine = new FormulaEngine();
    const components: CostComponent[] = [
      { id: '1', name: 'Pasir', category: 'MATERIAL', quantity: 5, unit: 'm3', unitPrice: 200000 },
    ];

    const result = engine.quickCalculate(components, { region: 'Surabaya' });
    expect(result.subtotal).toBe(1000000);
    expect(result.metadata.region).toBe('Surabaya');
  });

  it('normalizes categories properly', () => {
    expect(FormulaEngine.normalizeCategory('bahan')).toBe('MATERIAL');
    expect(FormulaEngine.normalizeCategory('MATERIAL')).toBe('MATERIAL');
    expect(FormulaEngine.normalizeCategory('upah')).toBe('UPAH');
    expect(FormulaEngine.normalizeCategory('tenaga_kerja')).toBe('UPAH');
    expect(FormulaEngine.normalizeCategory('pekerja')).toBe('UPAH');
    expect(FormulaEngine.normalizeCategory('jasa')).toBe('UPAH');
    expect(FormulaEngine.normalizeCategory('labor')).toBe('UPAH');
    expect(FormulaEngine.normalizeCategory('alat')).toBe('ALAT');
    expect(FormulaEngine.normalizeCategory('peralatan')).toBe('ALAT');
    expect(FormulaEngine.normalizeCategory('tool')).toBe('ALAT');
    expect(FormulaEngine.normalizeCategory('tools')).toBe('ALAT');
    expect(FormulaEngine.normalizeCategory('unknown_type')).toBe('OTHER');
    expect(FormulaEngine.normalizeCategory('')).toBe('OTHER');
  });

  it('builds context from AHS catalog entry', () => {
    const ahsEntry = {
      components: [
        { material_id: 'm1', nama: 'Semen Gresik', kategori: 'BAHAN', koefisien: 6.8, satuan: 'sak', harga_satuan: 60000 },
        { detail_id: 'd1', komponen: 'Tukang Batu', kategori: 'TENAGA', koefisien: 0.1, satuan: 'OH', hargaSatuan: 120000 },
        { kategori: 'ALAT', koefisien: 0.05, satuan: 'jam', harga_satuan: 50000 },
      ],
    };

    const ctx = FormulaEngine.fromAhsEntry(ahsEntry, { region: 'Bandung', projectName: 'Gedung A' });
    expect(ctx.components.length).toBe(3);
    expect(ctx.components[0].name).toBe('Semen Gresik');
    expect(ctx.components[0].category).toBe('MATERIAL');
    expect(ctx.components[1].name).toBe('Tukang Batu');
    expect(ctx.components[1].category).toBe('UPAH');
    expect(ctx.components[2].name).toBe('Unknown');
    expect(ctx.components[2].category).toBe('ALAT');
    expect(ctx.region).toBe('Bandung');
  });
});
