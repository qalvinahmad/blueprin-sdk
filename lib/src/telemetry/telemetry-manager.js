/**
 * Telemetry Manager - Manages telemetry adapters, event tracking, and plugin analytics.
 */

import { PLUGIN_API_VERSION } from '../core/constants.js';

export class TelemetryManager {
  /**
   * @param {Object} [options]
   * @param {any} [options.logger]
   * @param {string} [options.appId]
   * @param {boolean} [options.enabled]
   */
  constructor({ logger, appId = 'blueprin-app', enabled = true } = {}) {
    this._logger = logger;
    this._appId = appId;
    this._enabled = enabled;
    this._handlers = new Set();
  }

  addHandler(handler) {
    if (typeof handler !== 'function') {
      throw new Error('Telemetry handler must be a function');
    }
    this._handlers.add(handler);
    this._logger?.debug?.('Telemetry handler registered');

    return () => this.removeHandler(handler);
  }

  removeHandler(handler) {
    const deleted = this._handlers.delete(handler);
    if (deleted) {
      this._logger?.debug?.('Telemetry handler removed');
    }
    return deleted;
  }

  clear() {
    this._handlers.clear();
  }

  enable() {
    this._enabled = true;
    this._logger?.info?.('Telemetry enabled');
  }

  disable() {
    this._enabled = false;
    this._logger?.info?.('Telemetry disabled');
  }

  isEnabled() {
    return this._enabled;
  }

  async track(eventName, payload = {}, options = {}) {
    if (!this._enabled) {
      return null;
    }

    if (!eventName || typeof eventName !== 'string') {
      this._logger?.warn?.('Telemetry track called without a valid eventName');
      return null;
    }

    const eventData = {
      event: eventName,
      payload: { ...payload },
      appId: this._appId,
      pluginId: options.pluginId || payload.pluginId || null,
      timestamp: Date.now(),
      sdkVersion: PLUGIN_API_VERSION,
    };

    this._logger?.debug?.(`Telemetry event: ${eventName}`, eventData);

    const promises = [];
    for (const handler of this._handlers) {
      try {
        const result = handler(eventData);
        if (result && typeof result.then === 'function') {
          promises.push(
            result.catch((error) => {
              this._logger?.error?.('Telemetry handler async error:', error);
            })
          );
        }
      } catch (error) {
        this._logger?.error?.('Telemetry handler sync error:', error);
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }

    return eventData;
  }

  handlerCount() {
    return this._handlers.size;
  }

  createScoped(pluginId) {
    return {
      track: (eventName, payload = {}, options = {}) =>
        this.track(eventName, payload, { ...options, pluginId }),
      isEnabled: () => this.isEnabled(),
    };
  }
}
