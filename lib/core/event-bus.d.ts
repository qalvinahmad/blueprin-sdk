/**
 * Event Bus - Pub/sub system for inter-plugin communication
 */
export declare class EventBus {
    private _logger;
    private _listeners;
    private _pluginRateLimiter;
    constructor({ logger }: {
        logger: any;
    });
    on(eventName: any, callback: any, options?: any): () => void;
    once(eventName: any, callback: any): () => void;
    off(eventName: any, callback: any): void;
    emit(eventName: any, data: any): Promise<void>;
    removeAllListeners(eventName: any): void;
    removePluginListeners(pluginId: any): void;
    listenerCount(eventName: any): any;
    createScoped(pluginId: any): {
        on: (eventName: any, callback: any, options?: any) => () => void;
        once: (eventName: any, callback: any) => () => void;
        off: (eventName: any, callback: any) => void;
        emit: (eventName: any, data: any) => Promise<void> | undefined;
    };
}
