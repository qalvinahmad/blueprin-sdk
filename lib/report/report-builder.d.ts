/**
 * Report Builder — Extensible report generation system.
 *
 * Plugins can register custom report types. The builder collects data,
 * applies formatters, and generates reports.
 */
export declare class ReportBuilder {
    constructor();
    /**
     * Register default data sources and formatters.
     */
    registerDefaults(): void;
    /**
     * Register a data source.
     */
    registerDataSource(name: any, fetcher: any): void;
    /**
     * Register a formatter.
     */
    registerFormatter(name: any, formatter: any): void;
    /**
     * Register a report type.
     */
    registerReportType(name: any, config: any): void;
    /**
     * Generate a report.
     */
    generate(reportType: any, options?: {}): Promise<any>;
    /**
     * List available report types.
     */
    listReportTypes(): unknown[];
}
export default ReportBuilder;
