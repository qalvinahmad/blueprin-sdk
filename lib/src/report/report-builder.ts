/**
 * Report Builder — Extensible report generation system.
 *
 * Plugins can register custom report types. The builder collects data,
 * applies formatters, and generates reports.
 *
 * @example
 * ```ts
 * import { ReportBuilder } from '@alvinahmad/blueprin-sdk/report';
 *
 * const builder = new ReportBuilder();
 *
 * // Register a custom data source
 * builder.registerDataSource('my_api', async (options) => {
 *   const res = await fetch('https://api.example.com/data');
 *   return res.json();
 * });
 *
 * // Register a custom report type
 * builder.registerReportType('custom_report', {
 *   name: 'Custom Report',
 *   dataSources: ['my_api'],
 *   formatter: 'csv',
 *   generate: (data) => data.my_api,
 * });
 *
 * // Generate the report
 * const result = await builder.generate('custom_report', { format: 'csv' });
 * ```
 */

export interface ReportTypeConfig {
  id: string;
  name: string;
  description?: string;
  dataSources: string[];
  formatter: string;
  generate: (data: Record<string, any>) => any;
}

export interface DataSourceFetcher {
  (options?: any): Promise<any> | any;
}

export interface FormatterFn {
  (data: any, options?: any): string;
}

export class ReportBuilder {
  public dataSources: Map<string, DataSourceFetcher>;
  public formatters: Map<string, FormatterFn>;
  public reportTypes: Map<string, ReportTypeConfig>;

  constructor() {
    this.dataSources = new Map();
    this.formatters = new Map();
    this.reportTypes = new Map();

    this.registerDefaults();
  }

  /**
   * Register default data sources and formatters.
   */
  registerDefaults() {
    // ── Formatters ──────────────────────────────────────────

    this.registerFormatter('csv', (data, options) => {
      if (!data?.length && typeof data !== 'object') return '';
      const items = Array.isArray(data) ? data : [data];
      if (!items.length) return '';
      const headers = options?.headers || Object.keys(items[0]);
      const rows = items.map((row: any) =>
        headers.map((h: string) => {
          const val = row[h];
          if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return String(val ?? '');
        }).join(',')
      );
      return [headers.join(','), ...rows].join('\n');
    });

    this.registerFormatter('json', (data) => JSON.stringify(data, null, 2));

    this.registerFormatter('markdown', (data, options) => {
      const items = Array.isArray(data) ? data : [data];
      if (!items.length) return '';
      const headers = options?.headers || Object.keys(items[0]);
      const headerRow = `| ${headers.join(' | ')} |`;
      const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
      const rows = items.map((row: any) =>
        `| ${headers.map((h: string) => String(row[h] ?? '')).join(' | ')} |`
      );
      return [headerRow, separatorRow, ...rows].join('\n');
    });

    this.registerFormatter('html', (data, options) => {
      const items = Array.isArray(data) ? data : [data];
      if (!items.length) return '<table></table>';
      const headers = options?.headers || Object.keys(items[0]);
      const ths = headers.map((h: string) => `<th>${h}</th>`).join('');
      const rows = items.map((row: any) => {
        const tds = headers.map((h: string) => `<td>${row[h] ?? ''}</td>`).join('');
        return `<tr>${tds}</tr>`;
      }).join('');
      return `<table><thead><tr>${ths}</tr></thead><tbody>${rows}</tbody></table>`;
    });

    // ── Built-in Report Types ───────────────────────────────

    this.registerReportType('boq', {
      id: 'boq',
      name: 'Bill of Quantities',
      description: 'List of work items with unit prices and quantities',
      dataSources: ['ahs', 'materials'],
      formatter: 'csv',
      generate: (data: any) => {
        return (data.ahs || []).map((ahsItem: any) => ({
          code: ahsItem.kode,
          description: ahsItem.name || ahsItem.uraian,
          unit: ahsItem.satuan,
          price: ahsItem.harga,
        }));
      },
    });

    this.registerReportType('cost_estimate', {
      id: 'cost_estimate',
      name: 'Cost Estimate',
      description: 'Detailed cost breakdown with materials, labor, and equipment',
      dataSources: ['ahs', 'materials', 'labor', 'equipment'],
      formatter: 'csv',
      generate: (data: any) => {
        const total = (data.ahs || []).reduce(
          (sum: number, item: any) => sum + (item.harga || 0),
          0
        );
        return {
          items: data.ahs || [],
          total,
          generatedAt: new Date().toISOString(),
        };
      },
    });

    this.registerReportType('rab_detailed', {
      id: 'rab_detailed',
      name: 'Budget Plan Detailed',
      description: 'Complete RAB with material, labor, and equipment cost breakdown',
      dataSources: ['ahs', 'materials', 'labor', 'equipment'],
      formatter: 'markdown',
      generate: (data: any) => {
        return (data.ahs || []).map((item: any) => ({
          ...item,
          material_cost: (item.materials || []).reduce(
            (s: number, m: any) => s + (m.subtotal || 0),
            0
          ),
          labor_cost: (item.labor || []).reduce(
            (s: number, u: any) => s + (u.subtotal || 0),
            0
          ),
          equipment_cost: (item.equipment || []).reduce(
            (s: number, a: any) => s + (a.subtotal || 0),
            0
          ),
        }));
      },
    });

    this.registerReportType('rab_summary', {
      id: 'rab_summary',
      name: 'Budget Plan Summary',
      description: 'Aggregated RAB totals by category',
      dataSources: ['rab_items'],
      formatter: 'csv',
      generate: (data: any) => {
        const items = data.rab_items || [];
        const grouped: Record<string, any> = {};
        for (const item of items) {
          const cat = item.kategori || 'Other';
          if (!grouped[cat]) {
            grouped[cat] = { category: cat, total: 0, count: 0 };
          }
          grouped[cat].total += (item.volume || 0) * (item.harga_satuan || 0);
          grouped[cat].count += 1;
        }
        return Object.values(grouped);
      },
    });

    this.registerReportType('material_usage', {
      id: 'material_usage',
      name: 'Material Usage Report',
      description: 'Material quantities and costs across all work items',
      dataSources: ['materials', 'ahs'],
      formatter: 'csv',
      generate: (data: any) => {
        const materials = data.materials || [];
        return materials.map((m: any) => ({
          name: m.nama || m.name,
          category: m.kategori || m.category,
          unit: m.satuan || m.unit,
          unit_price: m.harga || m.price,
          total_used: m.total_used || 0,
          total_cost: (m.total_used || 0) * (m.harga || m.price || 0),
        }));
      },
    });

    this.registerReportType('labor_summary', {
      id: 'labor_summary',
      name: 'Labor Summary',
      description: 'Workforce roles, rates, and attendance summary',
      dataSources: ['workforce'],
      formatter: 'csv',
      generate: (data: any) => {
        const workers = data.workforce || [];
        return workers.map((w: any) => ({
          name: w.name,
          role: w.role,
          daily_rate: w.daily_rate,
          overtime_rate: w.overtime_rate,
          days_present: w.days_present || 0,
          total_wages: (w.days_present || 0) * (w.daily_rate || 0),
        }));
      },
    });

    this.registerReportType('schedule_gantt', {
      id: 'schedule_gantt',
      name: 'Schedule / Gantt Data',
      description: 'Project schedule phases and tasks with dates',
      dataSources: ['schedule'],
      formatter: 'json',
      generate: (data: any) => {
        const schedule = data.schedule || {};
        return {
          phases: schedule.phases || [],
          tasks: (schedule.tasks || []).map((t: any) => ({
            title: t.title,
            status: t.status,
            priority: t.priority,
            start_date: t.start_date,
            due_date: t.due_date,
            completed_date: t.completed_date,
          })),
          startDate: schedule.startDate,
          workDaysPerWeek: schedule.workDaysPerWeek,
        };
      },
    });

    this.registerReportType('project_overview', {
      id: 'project_overview',
      name: 'Project Overview',
      description: 'Project metadata, status, and key metrics',
      dataSources: ['project', 'rab_items', 'schedule'],
      formatter: 'json',
      generate: (data: any) => {
        const project = data.project || {};
        const rabItems = data.rab_items || [];
        const totalRAB = rabItems.reduce(
          (sum: number, item: any) => sum + (item.volume || 0) * (item.harga_satuan || 0),
          0
        );
        return {
          name: project.name,
          status: project.status_proyek,
          location: project.location,
          deadline: project.deadline,
          budget: project.budget,
          client: project.client_name,
          building_area: project.building_area_m2,
          total_rab: totalRAB,
          total_items: rabItems.length,
          generated_at: new Date().toISOString(),
        };
      },
    });

    this.registerReportType('cost_analysis', {
      id: 'cost_analysis',
      name: 'Cost Analysis',
      description: 'Detailed cost analysis with overhead, profit, and tax calculations',
      dataSources: ['rab_items'],
      formatter: 'csv',
      generate: (data: any) => {
        const items = data.rab_items || [];
        const subtotal = items.reduce(
          (sum: number, item: any) => sum + (item.volume || 0) * (item.harga_satuan || 0),
          0
        );
        const overhead = subtotal * 0.05;
        const profit = subtotal * 0.10;
        const tax = (subtotal + overhead + profit) * 0.11;
        const grandTotal = subtotal + overhead + profit + tax;
        return {
          items: items.map((item: any) => ({
            name: item.uraian || item.nama_item,
            volume: item.volume,
            unit: item.satuan,
            unit_price: item.harga_satuan,
            subtotal: (item.volume || 0) * (item.harga_satuan || 0),
          })),
          summary: {
            subtotal,
            overhead_5pct: overhead,
            profit_10pct: profit,
            tax_11pct: tax,
            grand_total: grandTotal,
          },
          generated_at: new Date().toISOString(),
        };
      },
    });
  }

  /**
   * Register a data source.
   * @param name - Unique identifier for the data source
   * @param fetcher - Async function that returns data
   */
  registerDataSource(name: string, fetcher: DataSourceFetcher) {
    this.dataSources.set(name, fetcher);
  }

  /**
   * Register an output formatter.
   * @param name - Format identifier (e.g., 'csv', 'json', 'pdf')
   * @param formatter - Function that transforms data to string
   */
  registerFormatter(name: string, formatter: FormatterFn) {
    this.formatters.set(name, formatter);
  }

  /**
   * Register a report type.
   * @param name - Report type identifier
   * @param config - Report type configuration
   */
  registerReportType(name: string, config: ReportTypeConfig) {
    this.reportTypes.set(name, { ...config, id: name });
  }

  /**
   * Generate a report by type.
   * @param reportType - Registered report type identifier
   * @param options - Generation options (format, filters, etc.)
   * @returns Generated report data
   */
  async generate(reportType: string, options: any = {}) {
    const config = this.reportTypes.get(reportType);
    if (!config) throw new Error(`Report type "${reportType}" not found.`);

    // Collect data from all registered data sources
    const data: Record<string, any> = {};
    for (const sourceName of config.dataSources) {
      const fetcher = this.dataSources.get(sourceName);
      if (fetcher) {
        data[sourceName] = await fetcher(options);
      }
    }

    // Generate the report using the type's generate function
    let result = config.generate(data);

    // Apply formatter
    const format = options.format || config.formatter;
    const formatter = this.formatters.get(format);
    if (formatter) {
      result = formatter(result, { headers: options.headers });
    }

    return result;
  }

  /**
   * Get a report type configuration.
   */
  getReportType(name: string): ReportTypeConfig | undefined {
    return this.reportTypes.get(name);
  }

  /**
   * List available report types.
   */
  listReportTypes() {
    return Array.from(this.reportTypes.entries()).map(([key, config]) => ({
      id: key,
      name: config.name,
      description: config.description,
      dataSources: config.dataSources,
      defaultFormat: config.formatter,
    }));
  }

  /**
   * List available data sources.
   */
  listDataSources() {
    return Array.from(this.dataSources.keys());
  }

  /**
   * List available formatters.
   */
  listFormatters() {
    return Array.from(this.formatters.keys());
  }

  /**
   * Check if a report type exists.
   */
  hasReportType(name: string): boolean {
    return this.reportTypes.has(name);
  }
}

export default ReportBuilder;
