/**
 * Logger - Configurable logging with prefix and debug support
 */
export declare class Logger {
    #private;
    constructor({ prefix, debug }: {
        prefix?: string | undefined;
        debug?: boolean | undefined;
    });
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
    debug(...args: any[]): void;
    success(...args: any[]): void;
}
