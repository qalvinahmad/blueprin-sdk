/**
 * Config Manager - Plugin and SDK configuration
 */

import { STORAGE_KEYS } from './constants.js';

export class ConfigManager {
  constructor({ appId, storagePrefix }) {
    this._appId = appId;
    this._storagePrefix = storagePrefix;
    this._configs = new Map();
  }

  async init() {
    try {
      const raw = localStorage.getItem(`${this._storagePrefix}:${STORAGE_KEYS.CONFIG}`);
      if (raw) {
        const data = JSON.parse(raw);
        for (const [key, value] of Object.entries(data)) {
          this._configs.set(key, value);
        }
      }
    } catch {
      // ignore
    }
  }

  get(key, defaultValue = undefined) {
    return this._configs.get(key) ?? defaultValue;
  }

  set(key, value) {
    this._configs.set(key, value);
    this._persist();
  }

  getAll() {
    return Object.fromEntries(this._configs);
  }

  remove(key) {
    this._configs.delete(key);
    this._persist();
  }

  _persist() {
    try {
      const data = Object.fromEntries(this._configs);
      localStorage.setItem(`${this._storagePrefix}:${STORAGE_KEYS.CONFIG}`, JSON.stringify(data));
    } catch {
      // ignore
    }
  }
}
