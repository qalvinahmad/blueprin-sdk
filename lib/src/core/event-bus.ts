/**
 * Event Bus - Pub/sub system for inter-plugin communication
 */

import { RateLimiter } from '../utils/index.js';

export class EventBus {
  private _logger: any;
  private _listeners: any;
  private _pluginRateLimiter: any;
  constructor({ logger }) {
    this._logger = logger;
    this._listeners = new Map();
    // Limit plugins to max 100 event emits per second to prevent UI lag/freezes
    this._pluginRateLimiter = new RateLimiter(100, 1000);
  }

  on(eventName, callback, options: any = {}) {
    if (!this._listeners.has(eventName)) {
      this._listeners.set(eventName, []);
    }

    const entry = { callback, pluginId: options.pluginId, priority: options.priority ?? 0 };
    const list = this._listeners.get(eventName);
    list.push(entry);
    list.sort((a, b) => b.priority - a.priority);

    return () => this.off(eventName, callback);
  }

  once(eventName, callback) {
    const wrapper = (...args) => {
      this.off(eventName, wrapper);
      callback(...args);
    };
    return this.on(eventName, wrapper);
  }

  off(eventName, callback) {
    const list = this._listeners.get(eventName);
    if (!list) return;

    const idx = list.findIndex((entry) => entry.callback === callback);
    if (idx !== -1) {
      list.splice(idx, 1);
    }

    if (list.length === 0) {
      this._listeners.delete(eventName);
    }
  }

  async emit(eventName, data) {
    const list = this._listeners.get(eventName);
    if (!list || list.length === 0) return;

    this._logger.debug(`Event: ${eventName}`, data);

    for (const entry of list) {
      try {
        await entry.callback(data);
      } catch (error) {
        this._logger.error(`Error in event listener for "${eventName}":`, error);
      }
    }
  }

  removeAllListeners(eventName) {
    if (eventName) {
      this._listeners.delete(eventName);
    } else {
      this._listeners.clear();
    }
  }

  removePluginListeners(pluginId) {
    for (const [eventName, list] of this._listeners) {
      const filtered = list.filter((entry) => entry.pluginId !== pluginId);
      if (filtered.length === 0) {
        this._listeners.delete(eventName);
      } else {
        this._listeners.set(eventName, filtered);
      }
    }
  }

  listenerCount(eventName) {
    if (eventName) {
      return this._listeners.get(eventName)?.length ?? 0;
    }
    let count = 0;
    for (const list of this._listeners.values()) {
      count += list.length;
    }
    return count;
  }

  createScoped(pluginId) {
    return {
      on: (eventName, callback, options: any = {}) =>
        this.on(eventName, callback, { ...options, pluginId }),
      once: (eventName, callback) => {
        const wrapper = (...args) => {
          this.off(eventName, wrapper);
          callback(...args);
        };
        return this.on(eventName, wrapper, { pluginId });
      },
      off: (eventName, callback) => this.off(eventName, callback),
      emit: (eventName, data) => {
        if (!this._pluginRateLimiter.checkLimit(pluginId)) {
          this._logger.warn(`Plugin "${pluginId}" exceeded event emission rate limit! Event "${eventName}" dropped.`);
          return;
        }
        return this.emit(eventName, data);
      },
    };
  }
}
