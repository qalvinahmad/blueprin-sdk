/**
 * Storage Adapter - localStorage + Supabase hybrid storage with SSR safety
 */

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export class StorageAdapter {
  constructor({ prefix = 'blueprin_sdk', supabaseClient, supabaseUrl, supabaseKey }) {
    this._prefix = prefix;
    this._supabase = supabaseClient || null;
    this._cache = new Map();
    this._initialized = false;
  }

  async init() {
    this._initialized = true;
  }

  async get(key) {
    if (this._cache.has(key)) {
      return this._cache.get(key);
    }

    if (isBrowser()) {
      try {
        const raw = localStorage.getItem(this._key(key));
        if (raw !== null) {
          const value = JSON.parse(raw);
          this._cache.set(key, value);
          return value;
        }
      } catch {
        // localStorage might be full or corrupted
      }
    }

    return null;
  }

  async set(key, value) {
    this._cache.set(key, value);

    if (isBrowser()) {
      try {
        localStorage.setItem(this._key(key), JSON.stringify(value));
      } catch {
        // Storage full or unavailable
      }
    }
  }

  async remove(key) {
    this._cache.delete(key);

    if (isBrowser()) {
      try {
        localStorage.removeItem(this._key(key));
      } catch {
        // ignore
      }
    }
  }

  async has(key) {
    if (this._cache.has(key)) return true;

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
    const keys = [];

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

    if (isBrowser()) {
      const keysToRemove = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(this._prefix + ':')) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {
        // ignore
      }
    }
  }

  createScoped(pluginId) {
    const scopedPrefix = `${this._prefix}:plugin:${pluginId}`;

    return {
      get: async (key) => this.get(`${scopedPrefix}:${key}`),
      set: async (key, value) => this.set(`${scopedPrefix}:${key}`, value),
      remove: async (key) => this.remove(`${scopedPrefix}:${key}`),
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
