/**
 * Formula Engine - Extensible calculation engine for RAB
 */
export declare class FormulaEngine {
    private _hooks;
    private _logger;
    private _pipelines;
    constructor({ hooks, logger }: {
        hooks: any;
        logger: any;
    });
    registerCoefficient(name: any, evaluator: any): void;
    registerEscalation(name: any, evaluator: any): void;
    registerAllowance(name: any, evaluator: any): void;
    registerOverhead(name: any, evaluator: any): void;
    registerProfit(name: any, evaluator: any): void;
    registerTax(name: any, evaluator: any): void;
    _register(type: any, name: any, evaluator: any): void;
    /**
     * Applies a chain of formulas to an initial value.
     * @param {string} type - The pipeline type (e.g. 'overhead')
     * @param {Object} context - Context object (e.g. { item, baseTotal })
     * @param {number} initialValue - The starting value before formulas are applied
     * @returns {number} The final calculated value (either a modified amount or an added value)
     */
    applyChain(type: any, context: any, initialValue: any): Promise<any>;
}
