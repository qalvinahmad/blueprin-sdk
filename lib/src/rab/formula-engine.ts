/**
 * Formula Engine - Extensible calculation engine for RAB
 */
export class FormulaEngine {
  private _hooks: any;
  private _logger: any;
  private _pipelines: any;
  constructor({ hooks, logger }) {
    this._hooks = hooks;
    this._logger = logger;
    
    // Typed registries
    this._pipelines = {
      coefficient: [],
      escalation: [],
      allowance: [],
      overhead: [],
      profit: [],
      tax: []
    };
  }

  // Registration Methods
  registerCoefficient(name, evaluator) { this._register('coefficient', name, evaluator); }
  registerEscalation(name, evaluator) { this._register('escalation', name, evaluator); }
  registerAllowance(name, evaluator) { this._register('allowance', name, evaluator); }
  registerOverhead(name, evaluator) { this._register('overhead', name, evaluator); }
  registerProfit(name, evaluator) { this._register('profit', name, evaluator); }
  registerTax(name, evaluator) { this._register('tax', name, evaluator); }

  _register(type, name, evaluator) {
    if (!this._pipelines[type]) {
      throw new Error(`Invalid formula pipeline type: ${type}`);
    }
    this._pipelines[type].push({ name, evaluator });
    this._logger?.debug(`Formula registered in ${type}: ${name}`);
  }

  /**
   * Applies a chain of formulas to an initial value.
   * @param {string} type - The pipeline type (e.g. 'overhead')
   * @param {Object} context - Context object (e.g. { item, baseTotal })
   * @param {number} initialValue - The starting value before formulas are applied
   * @returns {number} The final calculated value (either a modified amount or an added value)
   */
  async applyChain(type, context, initialValue) {
    if (!this._pipelines[type]) {
      throw new Error(`Invalid formula pipeline type: ${type}`);
    }

    let currentValue = initialValue;

    for (const formula of this._pipelines[type]) {
      const stepContext = { ...context, currentValue };
      
      // Allow plugins to intercept the context BEFORE this formula runs
      const preCtx = await this._hooks.executeBefore(`blueprin:before:formula:${type}:${formula.name}`, stepContext);
      
      const stepResult = await formula.evaluator(preCtx);
      
      // Allow plugins to intercept the result AFTER this formula runs
      const postCtx = await this._hooks.executeAfter(`blueprin:after:formula:${type}:${formula.name}`, { context: preCtx, result: stepResult });
      
      currentValue = postCtx.result !== undefined ? postCtx.result : stepResult;
    }

    return currentValue;
  }
}
