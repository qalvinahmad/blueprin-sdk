/**
 * Report Builder — Extensible report generation system.
 *
 * Plugins can register custom report types. The builder collects data,
 * applies formatters, and generates reports.
 */
export declare class ReportBuilder {
    dataSources: Map<string, (options?: any) => Promise<any> | any>;
    formatters: Map<string, (data: any, options?: any) => string>;
    reportTypes: Map<string, any>;
    constructor();
    /**
     * Register default data sources and formatters.
     */
    registerDefaults(): void;
    /**
     * Register a data source.
     */
    registerDataSource(name: string, fetcher: (options?: any) => any): void;
    /**
     * Register a formatter.
     */
    registerFormatter(name: string, formatter: (data: any, options?: any) => string): void;
    /**
     * Register a report type.
     */
    registerReportType(name: string, config: any): void;
    /**
     * Generate a report.
     */
    generate(reportType: string, options?: any): Promise<any>;
    /**
     * List available report types.
     */
    listReportTypes(): {
        id: string;
        name: any;
        dataSources: any;
        defaultFormat: any;
    }[];
}
export default ReportBuilder;
