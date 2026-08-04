/**
 * Report Registry - Manages custom report definitions and generation
 */
export class ReportClient {
  private _hooks: any;
  private _events: any;
  private _logger: any;
  private _reports: any;
  constructor({ hooks, events, logger }) {
    this._hooks = hooks;
    this._events = events;
    this._logger = logger;
    this._reports = new Map();
  }

  /**
   * Register a new report template
   * @param {string} reportId Unique identifier for the report
   * @param {object} definition Report configuration (name, description, generate, layout)
   */
  register(reportId, definition, pluginId = 'system') {
    if (this._reports.has(reportId)) {
      this._logger?.warn(`Report [${reportId}] is being overwritten by plugin [${pluginId}]`);
    }

    if (!definition.generate && !definition.layout) {
      throw new Error(`Report "${reportId}" must define either a 'generate' function or a 'layout' component`);
    }

    this._reports.set(reportId, { ...definition, pluginId });
    this._logger?.info(`Registered report: ${reportId} (by ${pluginId})`);
    
    this._events.emit('blueprin:report:registered', { reportId, pluginId });
  }

  /**
   * Get a report definition
   */
  get(reportId) {
    return this._reports.get(reportId);
  }

  /**
   * List all registered reports
   */
  list() {
    return Array.from(this._reports.entries()).map(([id, def]: any) => ({
      id,
      name: def.name || id,
      description: def.description || '',
      pluginId: def.pluginId,
    }));
  }

  /**
   * Generate a report
   */
  async generate(reportId, context = {}) {
    const report = this.get(reportId);
    if (!report) {
      throw new Error(`Report "${reportId}" not found in registry`);
    }

    if (!report.generate && !report.layout) {
      throw new Error(`Report "${reportId}" is invalid (missing generate or layout)`);
    }

    this._logger?.debug(`Generating report: ${reportId}`);

    // Allow plugins to intercept and modify the context/parameters before generation
    const preCtx = await this._hooks.executeBefore(`blueprin:before:report:${reportId}`, context);
    
    // Call the actual report generator logic if provided
    let result = preCtx;
    if (typeof report.generate === 'function') {
      result = await report.generate(preCtx);
    }

    // Allow plugins to intercept and modify the final output
    const postCtx = await this._hooks.executeAfter(`blueprin:after:report:${reportId}`, { context: preCtx, result });

    this._events.emit('blueprin:report:generated', { reportId, context: preCtx });

    return postCtx.result !== undefined ? postCtx.result : result;
  }
}
