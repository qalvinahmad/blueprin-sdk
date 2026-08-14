/**
 * Telemetry Manager - Manages telemetry adapters, event tracking, and plugin analytics.
 *
 * Authorized by: @akashbirajdar04
 * TypeScript port of PR #15 (https://github.com/qalvinahmad/blueprin-sdk/pull/15)
 */

import { PLUGIN_API_VERSION } from '../core/constants.js';

export interface TelemetryEventPayload {
  event: string;
  payload: Record<string, any>;
  appId: string;
  pluginId: string | null;
  timestamp: number;
  sdkVersion: string;
}

export interface TelemetryTrackOptions {
  pluginId?: string;
}

export type TelemetryHandler = (eventData: TelemetryEventPayload) => void | Promise<void>;

export interface ScopedTelemetry {
  track: (eventName: string, payload?: Record<string, any>, options?: TelemetryTrackOptions) => Promise<TelemetryEventPayload | null>;
  isEnabled: () => boolean;
}

export interface TelemetryManagerOptions {
  logger?: any;
  appId?: string;
  enabled?: boolean;
}

export class TelemetryManager {
  private _logger: any;
  private _appId: string;
  private _enabled: boolean;
  private _handlers: Set<TelemetryHandler>;

  constructor({ logger, appId = 'blueprin-app', enabled = true }: TelemetryManagerOptions = {}) {
    this._logger = logger;
    this._appId = appId;
    this._enabled = enabled;
    this._handlers = new Set();
  }

  addHandler(handler: TelemetryHandler): () => boolean {
    if (typeof handler !== 'function') {
      throw new Error('Telemetry handler must be a function');
    }
    this._handlers.add(handler);
    this._logger?.debug?.('Telemetry handler registered');

    return () => this.removeHandler(handler);
  }

  removeHandler(handler: TelemetryHandler): boolean {
    const deleted = this._handlers.delete(handler);
    if (deleted) {
      this._logger?.debug?.('Telemetry handler removed');
    }
    return deleted;
  }

  clear(): void {
    this._handlers.clear();
  }

  enable(): void {
    this._enabled = true;
    this._logger?.info?.('Telemetry enabled');
  }

  disable(): void {
    this._enabled = false;
    this._logger?.info?.('Telemetry disabled');
  }

  isEnabled(): boolean {
    return this._enabled;
  }

  async track(
    eventName: string,
    payload: Record<string, any> = {},
    options: TelemetryTrackOptions = {}
  ): Promise<TelemetryEventPayload | null> {
    if (!this._enabled) {
      return null;
    }

    if (!eventName || typeof eventName !== 'string') {
      this._logger?.warn?.('Telemetry track called without a valid eventName');
      return null;
    }

    const eventData: TelemetryEventPayload = {
      event: eventName,
      payload: { ...payload },
      appId: this._appId,
      pluginId: options.pluginId || payload.pluginId || null,
      timestamp: Date.now(),
      sdkVersion: PLUGIN_API_VERSION,
    };

    this._logger?.debug?.(`Telemetry event: ${eventName}`, eventData);

    const promises: Promise<void>[] = [];
    for (const handler of this._handlers) {
      try {
        const result = handler(eventData);
        if (result && typeof (result as Promise<void>).then === 'function') {
          promises.push(
            (result as Promise<void>).catch((error) => {
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

  handlerCount(): number {
    return this._handlers.size;
  }

  createScoped(pluginId: string): ScopedTelemetry {
    return {
      track: (eventName, payload = {}, options = {}) =>
        this.track(eventName, payload, { ...options, pluginId }),
      isEnabled: () => this.isEnabled(),
    };
  }
}
