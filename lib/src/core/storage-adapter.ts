/**
 * Storage Adapter - localStorage + Supabase hybrid storage with SSR safety
 */

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

interface StorageAdapterOptions {
  prefix?: string;
  supabaseClient?: any;
  supabaseUrl?: string;
  supabaseKey?: string;
  adapter?: StorageAdapterDriver;
  logger?: { warn?: (...args: any[]) => void; error?: (...args: any[]) => void };
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

export class StorageError extends Error {
  constructor(message: string, public readonly operation: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'StorageError';
  }
}

export class StorageAdapter {
  private _prefix: any;
  private _supabase: any;
  private _cache: any;
  private _initialized: any;
  private _logger: StorageAdapterOptions['logger'];
  private _onError?: StorageAdapterOptions['onError'];
  private _useIndexedDB: boolean;
  private _dbPromise: Promise<IDBDatabase> | null = null;
  private _adapter?: StorageAdapterDriver;
  constructor({
    prefix = 'blueprin_sdk',
    supabaseClient,
    logger,
    onError,
    useIndexedDB = true,
    adapter,
  }: StorageAdapterOptions = {}) {
    this._prefix = prefix;
    this._supabase = supabaseClient || null;
    this._cache = new Map();
    this._initialized = false;
    this._logger = logger;
    this._onError = onError;
    this._useIndexedDB = useIndexedDB;
    this._adapter = adapter;
  }

  async init() {
    this._initialized = true;
  }

  async get(key) {
    if (this._cache.has(key)) {
      return this._cache.get(key);
    }

    if (this._adapter) {
      const stored = await this._adapter.get(this._key(key));
      if (stored !== undefined) {
        this._cache.set(key, stored);
        return stored;
      }
    } else if (this._canUseIndexedDB()) {
      const stored = await this._idbGet(key);
      if (stored !== undefined) {
        this._cache.set(key, stored);
        return stored;
      }
    } else if (isBrowser()) {
      try {
        const raw = localStorage.getItem(this._key(key));
        if (raw !== null) {
          const value = JSON.parse(raw);
          this._cache.set(key, value);
          return value;
        }
      } catch (error) {
        this._reportError('get', error);
      }
    }

    return null;
  }

  async set(key, value, options: any = {}) {
    const sync = options.sync || false;
    this._cache.set(key, value);

    // 1. Sync to LocalStorage (Fast & Offline)
    if (this._adapter) {
      await this._adapter.set(this._key(key), value);
    } else if (this._canUseIndexedDB()) {
      await this._idbSet(key, value);
    } else if (isBrowser()) {
      try {
        localStorage.setItem(this._key(key), JSON.stringify(value));
      } catch (error) {
        this._reportError('set', error);
      }
    }

    // 2. Auto-sync to Supabase if requested (Hybrid Cloud)
    if (sync && this._supabase) {
      const table = options.table || 'plugin_storage_sync';
      // Fire-and-forget sync to avoid blocking the main thread UI
      this.syncToSupabase(table, this._key(key), { value }).catch(err => {
        console.error(`[StorageAdapter] Auto-sync failed for key ${key}:`, err);
      });
    }
  }

  async remove(key, options: any = {}) {
    const sync = options.sync || false;
    this._cache.delete(key);

    if (this._adapter) {
      await this._adapter.remove?.(this._key(key));
    } else if (this._canUseIndexedDB()) {
      try {
        const db = await this._openDB();
        await new Promise<void>((resolve, reject) => {
          const request = db.transaction('values', 'readwrite').objectStore('values').delete(this._key(key));
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        this._reportError('remove', error);
      }
    } else if (isBrowser()) {
      try {
        localStorage.removeItem(this._key(key));
      } catch (error) {
        this._reportError('remove', error);
      }
    }

    if (sync && this._supabase) {
      const table = options.table || 'plugin_storage_sync';
      this._supabase.from(table).delete().eq('id', this._key(key)).then();
    }
  }

  async has(key) {
    if (this._cache.has(key)) return true;

    if (this._adapter) {
      return this._adapter.has ? await this._adapter.has(this._key(key)) : (await this._adapter.get(this._key(key))) !== undefined;
    }
    if (this._canUseIndexedDB()) {
      return (await this._idbGet(key)) !== undefined;
    }

    if (isBrowser()) {
      try {
        return localStorage.getItem(this._key(key)) !== null;
      } catch {
        return false;
      }
    }

    return false;
  }

  async keys() {
    const keys: string[] = [];

    const adapter = this._adapter;
    if (adapter && adapter.keys) {
      return adapter.keys();
    }

    if (isBrowser()) {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(this._prefix + ':')) {
            keys.push(k.slice(this._prefix.length + 1));
          }
        }
      } catch {
        // ignore
      }
    }

    return keys;
  }

  async clear() {
    this._cache.clear();

    if (this._adapter) {
      await this._adapter.clear?.();
    } else if (this._canUseIndexedDB()) {
      try {
        const db = await this._openDB();
        await new Promise<void>((resolve, reject) => {
          const request = db.transaction('values', 'readwrite').objectStore('values').clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } catch (error) {
        this._reportError('clear', error);
      }
    } else if (isBrowser()) {
      const keysToRemove: string[] = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(this._prefix + ':')) {
            keysToRemove.push(k);
          }

        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch (error) {
        this._reportError('clear', error);
      }
    }
  }

  private _canUseIndexedDB(): boolean {
    return this._useIndexedDB && typeof indexedDB !== 'undefined';
  }

  private _reportError(operation: string, cause: unknown): void {
    const error = new StorageError(`Storage ${operation} failed`, operation, { cause });
    this._logger?.warn?.(error.message, cause);
    this._onError?.(error);
  }

  private _openDB(): Promise<IDBDatabase> {
    if (this._dbPromise) return this._dbPromise;
    this._dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(`${this._prefix}:store`, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('values');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }).catch((error) => {
      this._reportError('open', error);
      throw error;
    });
    return this._dbPromise!;
  }

  private async _idbGet(key: string): Promise<any> {
    try {
      const db = await this._openDB();
      return await new Promise((resolve, reject) => {
        const request = db.transaction('values', 'readonly').objectStore('values').get(this._key(key));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      this._reportError('get', error);
      return undefined;
    }
  }

  private async _idbSet(key: string, value: any): Promise<void> {
    try {
      const db = await this._openDB();
      await new Promise<void>((resolve, reject) => {
        const request = db.transaction('values', 'readwrite').objectStore('values').put(value, this._key(key));
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      this._reportError('set', error);
    }
  }

  createScoped(pluginId) {
    const scopedPrefix = `${this._prefix}:plugin:${pluginId}`;

    return {
      get: async (key) => this.get(`${scopedPrefix}:${key}`),
      set: async (key, value, options: any = {}) => this.set(`${scopedPrefix}:${key}`, value, options),
      remove: async (key, options: any = {}) => this.remove(`${scopedPrefix}:${key}`, options),
      has: async (key) => this.has(`${scopedPrefix}:${key}`),
    };
  }

  async syncToSupabase(table, id, data) {
    if (!this._supabase) return;

    try {
      const { error } = await this._supabase
        .from(table)
        .upsert({ id, ...data, updated_at: new Date().toISOString() });

      if (error) throw error;
    } catch (error) {
      console.error('Supabase sync error:', error);
    }
  }

  _key(key) {
    return `${this._prefix}:${key}`;
  }
}
