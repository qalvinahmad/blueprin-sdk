/**
 * Report Builder — Extensible report generation system.
 *
 * Plugins can register custom report types. The builder collects data,
 * applies formatters, and generates reports.
 */

export class ReportBuilder {
  public dataSources: Map<string, (options?: any) => Promise<any> | any>;
  public formatters: Map<string, (data: any, options?: any) => string>;
  public reportTypes: Map<string, any>;

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
    this.registerFormatter("csv", (data, options) => {
      if (!data?.length) return "";
      const headers = options?.headers || Object.keys(data[0]);
      const rows = data.map((row: any) => headers.map((h: string) => String(row[h] ?? "")).join(","));
      return [headers.join(","), ...rows].join("\n");
    });

    this.registerFormatter("json", (data) => JSON.stringify(data, null, 2));

    this.registerFormatter("markdown", (data, options) => {
      if (!data?.length) return "";
      const headers = options?.headers || Object.keys(data[0]);
      const headerRow = `| ${headers.join(" | ")} |`;
      const separatorRow = `| ${headers.map(() => "---").join(" | ")} |`;
      const rows = data.map((row: any) => `| ${headers.map((h: string) => String(row[h] ?? "")).join(" | ")} |`);
      return [headerRow, separatorRow, ...rows].join("\n");
    });

    this.registerReportType("boq", {
      name: "Bill of Quantities",
      dataSources: ["ahs", "materials"],
      formatter: "csv",
      generate: (data: any) => {
        return data.ahs?.map((ahsItem: any) => ({
          code: ahsItem.kode,
          description: ahsItem.name,
          unit: ahsItem.satuan,
          price: ahsItem.harga,
        })) || [];
      },
    });

    this.registerReportType("cost_estimate", {
      name: "Cost Estimate",
      dataSources: ["ahs", "materials", "labor", "equipment"],
      formatter: "csv",
      generate: (data: any) => {
        const total = (data.ahs || []).reduce((sum: number, item: any) => sum + (item.harga || 0), 0);
        return {
          items: data.ahs || [],
          total,
          generatedAt: new Date().toISOString(),
        };
      },
    });

    this.registerReportType("rab_detailed", {
      name: "Budget Plan Detailed",
      dataSources: ["ahs", "materials", "labor", "equipment"],
      formatter: "markdown",
      generate: (data: any) => {
        return (data.ahs || []).map((item: any) => ({
          ...item,
          material_cost: (item.materials || []).reduce((s: number, m: any) => s + (m.subtotal || 0), 0),
          labor_cost: (item.labor || []).reduce((s: number, u: any) => s + (u.subtotal || 0), 0),
          equipment_cost: (item.equipment || []).reduce((s: number, a: any) => s + (a.subtotal || 0), 0),
        }));
      },
    });
  }

  /**
   * Register a data source.
   */
  registerDataSource(name: string, fetcher: (options?: any) => any) {
    this.dataSources.set(name, fetcher);
  }

  /**
   * Register a formatter.
   */
  registerFormatter(name: string, formatter: (data: any, options?: any) => string) {
    this.formatters.set(name, formatter);
  }

  /**
   * Register a report type.
   */
  registerReportType(name: string, config: any) {
    this.reportTypes.set(name, config);
  }

  /**
   * Generate a report.
   */
  async generate(reportType: string, options: any = {}) {
    const config = this.reportTypes.get(reportType);
    if (!config) throw new Error(`Report type "${reportType}" not found.`);

    const data: Record<string, any> = {};
    for (const sourceName of config.dataSources) {
      const fetcher = this.dataSources.get(sourceName);
      if (fetcher) {
        data[sourceName] = await fetcher(options);
      }
    }

    let result = config.generate(data);

    const formatter = this.formatters.get(options.format || config.formatter);
    if (formatter) {
      result = formatter(result, { headers: options.headers });
    }

    return result;
  }

  /**
   * List available report types.
   */
  listReportTypes() {
    return Array.from(this.reportTypes.entries()).map(([key, config]: [string, any]) => ({
      id: key,
      name: config.name,
      dataSources: config.dataSources,
      defaultFormat: config.formatter,
    }));
  }
}

export default ReportBuilder;

