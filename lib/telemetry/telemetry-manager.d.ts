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
export declare class TelemetryManager {
    private _logger;
    private _appId;
    private _enabled;
    private _handlers;
    private _ingestUrl;
    private _flushIntervalMs;
    private _batchSize;
    private _batch;
    private _flushTimer;
    private _sessionId;
    private _metricsBuffer;
    private _healthState;
    private _timers;
    private _startTime;
    constructor({ logger, appId, enabled, ingestUrl, flushIntervalMs, batchSize, sessionId, }?: TelemetryManagerOptions);
    private _generateSessionId;
    private _startAutoFlush;
    addHandler(handler: TelemetryHandler): () => boolean;
    removeHandler(handler: TelemetryHandler): boolean;
    clear(): void;
    enable(): void;
    disable(): void;
    isEnabled(): boolean;
    track(eventName: string, payload?: Record<string, any>, options?: TelemetryTrackOptions): Promise<TelemetryEventPayload | null>;
    recordMetric(pluginId: string, metricName: string, value: number, unit?: string, tags?: Record<string, any>): void;
    startTimer(pluginId: string, timerName: string): () => number;
    reportHealth(pluginId: string, status: HealthStatus, metadata?: Record<string, any>): void;
    getHealth(pluginId: string): HealthReport | null;
    getAllHealth(): HealthReport[];
    flush(): Promise<void>;
    private _sendToIngest;
    getMetricsSummary(pluginId: string): Record<string, {
        avg: number;
        min: number;
        max: number;
        count: number;
        unit: string;
    }>;
    handlerCount(): number;
    createScoped(pluginId: string): ScopedTelemetry;
    destroy(): void;
}
