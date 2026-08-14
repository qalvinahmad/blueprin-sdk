/**
 * Blueprin SDK - Main Entry Point
 */
export declare class BlueprinSDK {
    private _logger;
    private _config;
    private _storage;
    private _eventBus;
    private _hookRegistry;
    private _pluginManager;
    private _report;
    private _connectors;
    private _workforce;
    private _projects;
    private _materials;
    private _rab;
    private _schedule;
    private _marketplace;
    private _auth;
    private _telemetry;
    private _initialized;
    constructor(options?: any);
    _setupLifecycleTelemetry(): void;
    get version(): string;
    get plugins(): any;
    get events(): any;
    get hooks(): any;
    get storage(): any;
    get config(): any;
    get logger(): any;
    get telemetry(): any;
    get reports(): any;
    get connectors(): any;
    get workforce(): any;
    get projects(): any;
    get materials(): any;
    get rab(): any;
    get schedule(): any;
    get marketplace(): any;
    get auth(): any;
    init(): Promise<void>;
    /**
     * Alias for init() — backward-compatible with main app calling sdk.initialize()
     */
    initialize(): Promise<void>;
    destroy(): Promise<void>;
    getInfo(): {
        version: string;
        plugins: any;
        hooks: any;
        events: any;
        initialized: any;
    };
}
