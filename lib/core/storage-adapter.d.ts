/**
 * Storage Adapter - localStorage + Supabase hybrid storage with SSR safety
 */
export declare class StorageAdapter {
    private _prefix;
    private _supabase;
    private _cache;
    private _initialized;
    constructor({ prefix, supabaseClient, supabaseUrl, supabaseKey }: {
        prefix?: string | undefined;
        supabaseClient: any;
        supabaseUrl: any;
        supabaseKey: any;
    });
    init(): Promise<void>;
    get(key: any): Promise<any>;
    set(key: any, value: any, options?: any): Promise<void>;
    remove(key: any, options?: any): Promise<void>;
    has(key: any): Promise<boolean>;
    keys(): Promise<string[]>;
    clear(): Promise<void>;
    createScoped(pluginId: any): {
        get: (key: any) => Promise<any>;
        set: (key: any, value: any, options?: any) => Promise<void>;
        remove: (key: any, options?: any) => Promise<void>;
        has: (key: any) => Promise<boolean>;
    };
    syncToSupabase(table: any, id: any, data: any): Promise<void>;
    _key(key: any): string;
}
