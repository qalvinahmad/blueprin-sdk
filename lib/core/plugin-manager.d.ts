/**
 * Plugin Manager - Handles plugin lifecycle, registration, and resolution
 */
export declare class PluginManager {
    private _sdk;
    private _eventBus;
    private _hookRegistry;
    private _storage;
    private _logger;
    private _config;
    private _plugins;
    private _uiSlots;
    private _uiPages;
    constructor({ sdk, eventBus, hookRegistry, storage, logger, config }: {
        sdk: any;
        eventBus: any;
        hookRegistry: any;
        storage: any;
        logger: any;
        config: any;
    });
    init(): Promise<void>;
    register(manifest: any): Promise<{
        manifest: any;
        status: string;
        instance: null;
    }>;
    activate(pluginId: any): Promise<any>;
    deactivate(pluginId: any): Promise<void>;
    remove(pluginId: any): Promise<void>;
    activateAll(): Promise<void>;
    destroyAll(): Promise<void>;
    submitToMarketplace(pluginId: any): Promise<any>;
    get(pluginId: any): any;
    list(): any[];
    has(pluginId: any): any;
    getActiveInstances(): Map<any, any>;
    getUiComponents(type?: string): any;
    getUiSlot(slotName: any): any;
    getUiPages(): any[];
    _createPluginContext(pluginId: any): {
        sdk: any;
        pluginId: any;
        hooks: {
            register: (hookName: any, callback: any, options: any) => any;
            unregister: (hookName: any, callback: any) => any;
            execute: (hookName: any, context: any) => any;
            executeBefore: (hookName: any, context: any) => any;
            executeAfter: (hookName: any, context: any) => any;
        };
        events: {
            on: (event: any, callback: any) => any;
            emit: (event: any, data: any) => any;
        };
        storage: {
            get: (key: any) => Promise<any>;
            has: (key: any) => Promise<any>;
            set: (key: any, value: any, options: any) => Promise<any>;
            remove: (key: any, options: any) => Promise<any>;
        };
        ui: {
            registerSlot: (slotName: any, component: any) => void;
            addPage: (route: any, component: any, options?: any) => void;
        };
        logger: any;
        config: any;
    };
    _persistPlugins(): Promise<void>;
}
