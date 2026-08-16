/**
 * Telemetry Manager — Enhanced version with batching, performance tracking,
 * health monitoring, and server-side ingestion.
 *
 * Features:
 *   - Event batching with configurable flush interval
 *   - Performance metric recording (load time, memory, API calls)
 *   - Plugin health status tracking
 *   - Automatic error aggregation
 *   - Server-side ingestion via HTTP
 *   - Scoped telemetry per plugin
 */

import { PLUGIN_API_VERSION } from '../core/constants.js';

export interface TelemetryEventPayload {
  event: string;
  payload: Record<string, any>;
  appId: string;
  pluginId: string | null;
  timestamp: number;
  sdkVersion: string;
  sessionId?: string;
}

export interface TelemetryTrackOptions {
  pluginId?: string;
  immediate?: boolean;
}

export type TelemetryHandler = (eventData: TelemetryEventPayload) => void | Promise<void>;

export interface ScopedTelemetry {
  track: (eventName: string, payload?: Record<string, any>, options?: TelemetryTrackOptions) => Promise<TelemetryEventPayload | null>;
  recordMetric: (name: string, value: number, unit?: string, tags?: Record<string, any>) => void;
  reportHealth: (status: HealthStatus, metadata?: Record<string, any>) => void;
  startTimer: (name: string) => () => number;
  isEnabled: () => boolean;
}

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'error';

export interface HealthReport {
  pluginId: string;
  status: HealthStatus;
  loadTimeMs?: number;
  memoryUsageMb?: number;
  errorCount: number;
  warningCount: number;
  apiCallsCount: number;
  hooksRegisterd: number;
  listenersRegistered: number;
  uptimeMs: number;
  metadata?: Record<string, any>;
}

export interface TelemetryManagerOptions {
  logger?: any;
  appId?: string;
  enabled?: boolean;
  ingestUrl?: string;
  flushIntervalMs?: number;
  batchSize?: number;
  sessionId?: string;
}

export class TelemetryManager {
  private _logger: any;
  private _appId: string;
  private _enabled: boolean;
  private _handlers: Set<TelemetryHandler>;
  private _ingestUrl: string;
  private _flushIntervalMs: number;
  private _batchSize: number;
  private _batch: TelemetryEventPayload[];
  private _flushTimer: any;
  private _sessionId: string;
  private _metricsBuffer: Map<string, any[]>;
  private _healthState: Map<string, HealthReport>;
  private _timers: Map<string, number>;
  private _startTime: number;

  constructor({
    logger,
    appId = 'blueprin-app',
    enabled = true,
    ingestUrl = '/api/telemetry/ingest',
    flushIntervalMs = 30000,
    batchSize = 50,
    sessionId,
  }: TelemetryManagerOptions = {}) {
    this._logger = logger;
    this._appId = appId;
    this._enabled = enabled;
    this._handlers = new Set();
    this._ingestUrl = ingestUrl;
    this._flushIntervalMs = flushIntervalMs;
    this._batchSize = batchSize;
    this._batch = [];
    this._sessionId = sessionId || this._generateSessionId();
    this._metricsBuffer = new Map();
    this._healthState = new Map();
    this._timers = new Map();
    this._startTime = Date.now();

    if (typeof window !== 'undefined' && enabled) {
      this._startAutoFlush();
    }
  }

  private _generateSessionId(): string {
    return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private _startAutoFlush(): void {
    if (this._flushTimer) return;
    this._flushTimer = setInterval(() => {
      this.flush().catch((err) => {
        this._logger?.warn?.('Telemetry auto-flush failed:', err);
      });
    }, this._flushIntervalMs);

    if (typeof this._flushTimer === 'object' && this._flushTimer.unref) {
      this._flushTimer.unref();
    }
  }

  addHandler(handler: TelemetryHandler): () => boolean {
    if (typeof handler !== 'function') {
      throw new Error('Telemetry handler must be a function');
    }
    this._handlers.add(handler);
    return () => this.removeHandler(handler);
  }

  removeHandler(handler: TelemetryHandler): boolean {
    return this._handlers.delete(handler);
  }

  clear(): void {
    this._handlers.clear();
  }

  enable(): void {
    this._enabled = true;
    this._startAutoFlush();
  }

  disable(): void {
    this._enabled = false;
    if (this._flushTimer) {
      clearInterval(this._flushTimer);
      this._flushTimer = null;
    }
  }

  isEnabled(): boolean {
    return this._enabled;
  }

  async track(
    eventName: string,
    payload: Record<string, any> = {},
    options: TelemetryTrackOptions = {}
  ): Promise<TelemetryEventPayload | null> {
    if (!this._enabled) return null;
    if (!eventName || typeof eventName !== 'string') return null;

    const eventData: TelemetryEventPayload = {
      event: eventName,
      payload: { ...payload },
      appId: this._appId,
      pluginId: options.pluginId || payload.pluginId || null,
      timestamp: Date.now(),
      sdkVersion: PLUGIN_API_VERSION,
      sessionId: this._sessionId,
    };

    for (const handler of this._handlers) {
      try {
        const result = handler(eventData);
        if (result && typeof (result as Promise<void>).then === 'function') {
          await (result as Promise<void>).catch(() => {});
        }
      } catch {
        // handler errors should not break telemetry
      }
    }

    if (options.immediate) {
      this._sendToIngest([eventData]).catch(() => {});
    } else {
      this._batch.push(eventData);
      if (this._batch.length >= this._batchSize) {
        await this.flush();
      }
    }

    return eventData;
  }

  recordMetric(
    pluginId: string,
    metricName: string,
    value: number,
    unit: string = 'ms',
    tags: Record<string, any> = {}
  ): void {
    const key = `${pluginId}:${metricName}`;
    if (!this._metricsBuffer.has(key)) {
      this._metricsBuffer.set(key, []);
    }
    this._metricsBuffer.get(key)!.push({
      value,
      unit,
      tags,
      timestamp: Date.now(),
    });
  }

  startTimer(pluginId: string, timerName: string): () => number {
    const key = `${pluginId}:${timerName}`;
    const start = performance.now();
    this._timers.set(key, start);

    return () => {
      const elapsed = performance.now() - start;
      this._timers.delete(key);
      this.recordMetric(pluginId, timerName, Math.round(elapsed * 100) / 100, 'ms');
      return elapsed;
    };
  }

  reportHealth(
    pluginId: string,
    status: HealthStatus,
    metadata: Record<string, any> = {}
  ): void {
    const prev = this._healthState.get(pluginId);
    const report: HealthReport = {
      pluginId,
      status,
      errorCount: (prev?.errorCount || 0) + (status === 'error' ? 1 : 0),
      warningCount: (prev?.warningCount || 0) + (status === 'degraded' ? 1 : 0),
      apiCallsCount: metadata.apiCallsCount || prev?.apiCallsCount || 0,
      hooksRegisterd: metadata.hooksRegistered || prev?.hooksRegisterd || 0,
      listenersRegistered: metadata.listenersRegistered || prev?.listenersRegistered || 0,
      uptimeMs: Date.now() - this._startTime,
      ...metadata,
    };
    this._healthState.set(pluginId, report);

    this.track('plugin_health_report', {
      pluginId,
      status,
      ...metadata,
    }, { pluginId, immediate: true });
  }

  getHealth(pluginId: string): HealthReport | null {
    return this._healthState.get(pluginId) || null;
  }

  getAllHealth(): HealthReport[] {
    return Array.from(this._healthState.values());
  }

  async flush(): Promise<void> {
    if (this._batch.length === 0) return;
    const events = [...this._batch];
    this._batch = [];
    await this._sendToIngest(events);
  }

  private async _sendToIngest(events: TelemetryEventPayload[]): Promise<void> {
    if (!this._ingestUrl || typeof fetch === 'undefined') return;

    try {
      await fetch(this._ingestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
        keepalive: true,
      });
    } catch {
      // Ingest failure should not break the app
    }
  }

  getMetricsSummary(pluginId: string): Record<string, { avg: number; min: number; max: number; count: number; unit: string }> {
    const summary: Record<string, { avg: number; min: number; max: number; count: number; unit: string }> = {};

    for (const [key, entries] of this._metricsBuffer) {
      if (!key.startsWith(`${pluginId}:`)) continue;
      const metricName = key.slice(pluginId.length + 1);
      const values = entries.map((e) => e.value);
      const unit = entries[0]?.unit || 'ms';

      summary[metricName] = {
        avg: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100,
        min: Math.round(Math.min(...values) * 100) / 100,
        max: Math.round(Math.max(...values) * 100) / 100,
        count: values.length,
        unit,
      };
    }

    return summary;
  }

  handlerCount(): number {
    return this._handlers.size;
  }

  createScoped(pluginId: string): ScopedTelemetry {
    const manager = this;
    return {
      track: (eventName, payload = {}, options = {}) =>
        manager.track(eventName, payload, { ...options, pluginId }),
      recordMetric: (name, value, unit, tags) =>
        manager.recordMetric(pluginId, name, value, unit, tags),
      reportHealth: (status, metadata) =>
        manager.reportHealth(pluginId, status, metadata),
      startTimer: (name) =>
        manager.startTimer(pluginId, name),
      isEnabled: () => manager.isEnabled(),
    };
  }

  destroy(): void {
    this.disable();
    this.flush().catch(() => {});
    this._batch = [];
    this._metricsBuffer.clear();
    this._healthState.clear();
    this._timers.clear();
  }
}
