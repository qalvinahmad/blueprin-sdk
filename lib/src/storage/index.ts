/**
 * Storage Module - Re-exports storage adapter and helpers
 */

export { StorageAdapter } from '../core/storage-adapter.js';

/**
 * Helper to create a namespaced storage key
 *
 * @param {string} namespace
 * @param {string} key
 * @returns {string}
 */
export function createStorageKey(namespace, key) {
  return `${namespace}:${key}`;
}

/**
 * Common storage patterns
 */
export const StoragePatterns = {
  /**
   * Cache with TTL (time-to-live)
   * @param {Object} storage - StorageAdapter instance
   * @param {number} ttlMs - Time-to-live in milliseconds
   */
  withTTL: (storage, ttlMs = 60000) => ({
    get: async (key) => {
      const cached = await storage.get(`ttl:${key}`);
      if (cached && Date.now() - cached.timestamp < ttlMs) {
        return cached.data;
      }
      return null;
    },
    set: async (key, data) => {
      await storage.set(`ttl:${key}`, { data, timestamp: Date.now() });
    },
    remove: async (key) => {
      await storage.remove(`ttl:${key}`);
    },
  }),

  /**
   * JSON-validated storage
   * @param {Object} storage - StorageAdapter instance
   * @param {Function} validator - Validation function
   */
  validated: (storage, validator) => ({
    get: async (key) => {
      const data = await storage.get(key);
      if (data !== null && !validator(data)) {
        await storage.remove(key);
        return null;
      }
      return data;
    },
    set: async (key, data) => {
      if (!validator(data)) {
        throw new Error(`Validation failed for key "${key}"`);
      }
      await storage.set(key, data);
    },
  }),
};
