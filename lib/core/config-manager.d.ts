/**
 * Config Manager - Plugin and SDK configuration with SSR safety
 */
export declare class ConfigManager {
    private _appId;
    private _storagePrefix;
    private _configs;
    constructor({ appId, storagePrefix }: {
        appId: any;
        storagePrefix: any;
    });
    init(): Promise<void>;
    get(key: any, defaultValue?: undefined): any;
    set(key: any, value: any): void;
    getAll(): {
        [k: string]: any;
    };
    remove(key: any): void;
    _persist(): void;
}
