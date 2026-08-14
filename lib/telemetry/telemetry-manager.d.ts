/**
 * Telemetry Manager - Manages telemetry adapters, event tracking, and plugin analytics.
 *
 * Authorized by: @akashbirajdar04
 * TypeScript port of PR #15 (https://github.com/qalvinahmad/blueprin-sdk/pull/15)
 */
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
export declare class TelemetryManager {
    private _logger;
    private _appId;
    private _enabled;
    private _handlers;
    constructor({ logger, appId, enabled }?: TelemetryManagerOptions);
    addHandler(handler: TelemetryHandler): () => boolean;
    removeHandler(handler: TelemetryHandler): boolean;
    clear(): void;
    enable(): void;
    disable(): void;
    isEnabled(): boolean;
    track(eventName: string, payload?: Record<string, any>, options?: TelemetryTrackOptions): Promise<TelemetryEventPayload | null>;
    handlerCount(): number;
    createScoped(pluginId: string): ScopedTelemetry;
}
