/**
 * Thin wrapper that lets us attach a correlation id (call-scoped) and
 * a default service tag without polluting every call site.
 */
export interface LogContext {
    uid?: string;
    fn?: string;
    correlationId?: string;
    [k: string]: unknown;
}
export declare const logger: {
    debug: (msg: string, ctx?: LogContext, extra?: Record<string, unknown>) => void;
    info: (msg: string, ctx?: LogContext, extra?: Record<string, unknown>) => void;
    warn: (msg: string, ctx?: LogContext, extra?: Record<string, unknown>) => void;
    error: (msg: string, err: unknown, ctx?: LogContext) => void;
};
