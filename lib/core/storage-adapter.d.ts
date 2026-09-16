/**
 * Storage Adapter - localStorage + Supabase hybrid storage with SSR safety
 */
interface StorageAdapterOptions {
    prefix?: string;
    supabaseClient?: any;
    supabaseUrl?: string;
    supabaseKey?: string;
    adapter?: StorageAdapterDriver;
    logger?: {
        warn?: (...args: any[]) => void;
        error?: (...args: any[]) => void;
    };
    onError?: (error: StorageError) => void;
    useIndexedDB?: boolean;
}
export interface StorageAdapterDriver {
    get(key: string): Promise<unknown> | unknown;
    set(key: string, value: unknown): Promise<void> | void;
    remove?(key: string): Promise<void> | void;
    has?(key: string): Promise<boolean> | boolean;
    keys?(): Promise<string[]> | string[];
    clear?(): Promise<void> | void;
}
export declare class StorageError extends Error {
    readonly operation: string;
    constructor(message: string, operation: string, options?: {
        cause?: unknown;
    });
}
export declare class StorageAdapter {
    private _prefix;
    private _supabase;
    private _cache;
    private _initialized;
    private _logger;
    private _onError?;
    private _useIndexedDB;
    private _dbPromise;
    private _adapter?;
    constructor({ prefix, supabaseClient, logger, onError, useIndexedDB, adapter, }?: StorageAdapterOptions);
    init(): Promise<void>;
    get(key: any): Promise<any>;
    set(key: any, value: any, options?: any): Promise<void>;
    remove(key: any, options?: any): Promise<void>;
    has(key: any): Promise<boolean>;
    keys(): Promise<string[]>;
    clear(): Promise<void>;
    private _canUseIndexedDB;
    private _reportError;
    private _openDB;
    private _idbGet;
    private _idbSet;
    createScoped(pluginId: any): {
        get: (key: any) => Promise<any>;
        set: (key: any, value: any, options?: any) => Promise<void>;
        remove: (key: any, options?: any) => Promise<void>;
        has: (key: any) => Promise<boolean>;
    };
    syncToSupabase(table: any, id: any, data: any): Promise<void>;
    _key(key: any): string;
}
export {};
