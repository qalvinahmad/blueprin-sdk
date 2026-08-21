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
export declare class ReportBuilder {
    dataSources: Map<string, DataSourceFetcher>;
    formatters: Map<string, FormatterFn>;
    reportTypes: Map<string, ReportTypeConfig>;
    constructor();
    /**
     * Register default data sources and formatters.
     */
    registerDefaults(): void;
    /**
     * Register a data source.
     * @param name - Unique identifier for the data source
     * @param fetcher - Async function that returns data
     */
    registerDataSource(name: string, fetcher: DataSourceFetcher): void;
    /**
     * Register an output formatter.
     * @param name - Format identifier (e.g., 'csv', 'json', 'pdf')
     * @param formatter - Function that transforms data to string
     */
    registerFormatter(name: string, formatter: FormatterFn): void;
    /**
     * Register a report type.
     * @param name - Report type identifier
     * @param config - Report type configuration
     */
    registerReportType(name: string, config: ReportTypeConfig): void;
    /**
     * Generate a report by type.
     * @param reportType - Registered report type identifier
     * @param options - Generation options (format, filters, etc.)
     * @returns Generated report data
     */
    generate(reportType: string, options?: any): Promise<any>;
    /**
     * Get a report type configuration.
     */
    getReportType(name: string): ReportTypeConfig | undefined;
    /**
     * List available report types.
     */
    listReportTypes(): {
        id: string;
        name: string;
        description: string | undefined;
        dataSources: string[];
        defaultFormat: string;
    }[];
    /**
     * List available data sources.
     */
    listDataSources(): string[];
    /**
     * List available formatters.
     */
    listFormatters(): string[];
    /**
     * Check if a report type exists.
     */
    hasReportType(name: string): boolean;
}
export default ReportBuilder;
