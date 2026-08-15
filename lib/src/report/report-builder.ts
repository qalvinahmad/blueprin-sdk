/**
 * Report Builder — Extensible report generation system.
 *
 * Plugins can register custom report types. The builder collects data,
 * applies formatters, and generates reports.
 */

export class ReportBuilder {
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
      const rows = data.map((row) => headers.map((h) => String(row[h] ?? "")).join(","));
      return [headers.join(","), ...rows].join("\n");
    });

    this.registerFormatter("json", (data) => JSON.stringify(data, null, 2));

    this.registerFormatter("markdown", (data, options) => {
      if (!data?.length) return "";
      const headers = options?.headers || Object.keys(data[0]);
      const headerRow = `| ${headers.join(" | ")} |`;
      const separatorRow = `| ${headers.map(() => "---").join(" | ")} |`;
      const rows = data.map((row) => `| ${headers.map((h) => String(row[h] ?? "")).join(" | ")} |`);
      return [headerRow, separatorRow, ...rows].join("\n");
    });

    this.registerReportType("boq", {
      name: "Bill of Quantities",
      dataSources: ["ahs", "materials"],
      formatter: "csv",
      generate: (data) => {
        return data.ahs?.map((ahsItem) => ({
          kode: ahsItem.kode,
          uraian: ahsItem.name,
          satuan: ahsItem.satuan,
          harga: ahsItem.harga,
        })) || [];
      },
    });

    this.registerReportType("cost_estimate", {
      name: "Cost Estimate",
      dataSources: ["ahs", "materials", "upah", "alat"],
      formatter: "csv",
      generate: (data) => {
        const total = (data.ahs || []).reduce((sum, item) => sum + (item.harga || 0), 0);
        return {
          items: data.ahs || [],
          total,
          generatedAt: new Date().toISOString(),
        };
      },
    });

    this.registerReportType("rab_detailed", {
      name: "RAB Detailed",
      dataSources: ["ahs", "materials", "upah", "alat"],
      formatter: "markdown",
      generate: (data) => {
        return (data.ahs || []).map((item) => ({
          ...item,
          material_cost: (item.materials || []).reduce((s, m) => s + (m.subtotal || 0), 0),
          labor_cost: (item.upah || []).reduce((s, u) => s + (u.subtotal || 0), 0),
          equipment_cost: (item.alat || []).reduce((s, a) => s + (a.subtotal || 0), 0),
        }));
      },
    });
  }

  /**
   * Register a data source.
   */
  registerDataSource(name, fetcher) {
    this.dataSources.set(name, fetcher);
  }

  /**
   * Register a formatter.
   */
  registerFormatter(name, formatter) {
    this.formatters.set(name, formatter);
  }

  /**
   * Register a report type.
   */
  registerReportType(name, config) {
    this.reportTypes.set(name, config);
  }

  /**
   * Generate a report.
   */
  async generate(reportType, options = {}) {
    const config = this.reportTypes.get(reportType);
    if (!config) throw new Error(`Report type "${reportType}" not found.`);

    const data = {};
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
    return Array.from(this.reportTypes.entries()).map(([key, config]) => ({
      id: key,
      name: config.name,
      dataSources: config.dataSources,
      defaultFormat: config.formatter,
    }));
  }
}

export default ReportBuilder;
