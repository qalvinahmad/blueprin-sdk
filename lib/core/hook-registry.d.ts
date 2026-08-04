/**
 * Hook Registry - Before/after lifecycle hooks for extensibility
 */
export declare class HookRegistry {
    private _logger;
    private _hooks;
    constructor({ logger }: {
        logger: any;
    });
    register(hookName: any, callback: any, options?: any): () => void;
    unregister(hookName: any, callback: any): void;
    execute(hookName: any, context: any): Promise<any>;
    executeBefore(hookName: any, context: any): Promise<any>;
    executeAfter(hookName: any, context: any): Promise<any>;
    removePluginHooks(pluginId: any): void;
    clear(): void;
    count(hookName: any): any;
    createScoped(pluginId: any): {
        register: (hookName: any, callback: any, options?: any) => () => void;
        unregister: (hookName: any, callback: any) => void;
        execute: (hookName: any, context: any) => Promise<any>;
        executeBefore: (hookName: any, context: any) => Promise<any>;
        executeAfter: (hookName: any, context: any) => Promise<any>;
    };
}
