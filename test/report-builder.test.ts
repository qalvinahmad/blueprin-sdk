import { describe, it, expect, vi } from 'vitest';
import { ReportBuilder } from '../lib/src/report/report-builder.ts';
import { ReportClient } from '../lib/src/report/index.ts';

describe('ReportBuilder', () => {
  it('registers defaults formatters and report types', () => {
    const builder = new ReportBuilder();
    const reportTypes = builder.listReportTypes();
    const ids = reportTypes.map((r) => r.id);
    expect(ids).toContain('boq');
    expect(ids).toContain('cost_estimate');
    expect(ids).toContain('rab_detailed');
  });

  it('formats csv, json, and markdown data', async () => {
    const builder = new ReportBuilder();

    // Data sources
    builder.registerDataSource('ahs', async () => [
      { kode: 'A.1', name: 'Galian Tanah', satuan: 'm3', harga: 50000 },
      { kode: 'A.2', name: 'Pasang Pondasi', satuan: 'm3', harga: 750000 },
    ]);

    // BOQ report in CSV
    const csvReport = await builder.generate('boq');
    expect(csvReport).toContain('code,description,unit,price');
    expect(csvReport).toContain('A.1,Galian Tanah,m3,50000');

    // BOQ report in JSON
    const jsonReport = await builder.generate('boq', { format: 'json' });
    const parsed = JSON.parse(jsonReport);
    expect(parsed.length).toBe(2);
    expect(parsed[0].code).toBe('A.1');

    // Markdown formatter
    const mdFormatter = builder.formatters.get('markdown');
    const mdResult = mdFormatter([{ a: '1', b: '2' }]);
    expect(mdResult).toContain('| a | b |');
    expect(mdResult).toContain('| 1 | 2 |');

    // Empty data formatters
    expect(builder.formatters.get('csv')([])).toBe('');
    expect(builder.formatters.get('markdown')([])).toBe('');
  });

  it('generates cost_estimate report', async () => {
    const builder = new ReportBuilder();
    builder.registerDataSource('ahs', async () => [
      { kode: '1', harga: 100000 },
      { kode: '2', harga: 200000 },
    ]);

    const result = await builder.generate('cost_estimate', { format: 'json' });
    const parsed = JSON.parse(result);
    expect(parsed.total).toBe(300000);
    expect(parsed.items.length).toBe(2);
  });

  it('generates rab_detailed report', async () => {
    const builder = new ReportBuilder();
    builder.registerDataSource('ahs', async () => [
      {
        kode: 'AHS-1',
        materials: [{ subtotal: 50000 }],
        labor: [{ subtotal: 30000 }],
        equipment: [{ subtotal: 10000 }],
      },
    ]);

    const result = await builder.generate('rab_detailed', { format: 'json' });
    const parsed = JSON.parse(result);
    expect(parsed[0].material_cost).toBe(50000);
    expect(parsed[0].labor_cost).toBe(30000);
    expect(parsed[0].equipment_cost).toBe(10000);
  });

  it('throws on unknown report type', async () => {
    const builder = new ReportBuilder();
    await expect(builder.generate('unknown_type')).rejects.toThrow('Report type "unknown_type" not found');
  });

  it('allows registering custom data source and custom formatter', async () => {
    const builder = new ReportBuilder();
    builder.registerDataSource('customData', async () => [{ title: 'Hello' }]);
    builder.registerFormatter('customUpper', (data: any) => JSON.stringify(data).toUpperCase());
    builder.registerReportType('customReport', {
      name: 'Custom',
      dataSources: ['customData'],
      formatter: 'customUpper',
      generate: (d: any) => d.customData,
    });

    const res = await builder.generate('customReport');
    expect(res).toContain('"TITLE":"HELLO"');
  });
});

describe('ReportClient', () => {
  it('throws when report missing generate or layout on registration and execution', async () => {
    const hooks = { executeBefore: vi.fn((_, c) => c), executeAfter: vi.fn((_, c) => c) };
    const events = { emit: vi.fn() };
    const logger = { warn: vi.fn(), info: vi.fn(), debug: vi.fn() };

    const client = new ReportClient({ hooks, events, logger });

    expect(() => client.register('empty_report', {})).toThrow("must define either a 'generate' function or a 'layout' component");

    // Force invalid report into internal map to test execution validation
    (client as any)._reports.set('corrupt', { name: 'Corrupt' });
    await expect(client.generate('corrupt')).rejects.toThrow('Report "corrupt" is invalid');
  });
});
