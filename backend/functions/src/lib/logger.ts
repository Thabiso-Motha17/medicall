import { logger as fnLogger } from "firebase-functions/v2";

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

function fmt(ctx: LogContext | undefined, extra?: Record<string, unknown>) {
  return { service: "medicall", ...(ctx ?? {}), ...(extra ?? {}) };
}

export const logger = {
  debug: (msg: string, ctx?: LogContext, extra?: Record<string, unknown>) =>
    fnLogger.debug(msg, fmt(ctx, extra)),
  info:  (msg: string, ctx?: LogContext, extra?: Record<string, unknown>) =>
    fnLogger.info(msg, fmt(ctx, extra)),
  warn:  (msg: string, ctx?: LogContext, extra?: Record<string, unknown>) =>
    fnLogger.warn(msg, fmt(ctx, extra)),
  error: (msg: string, err: unknown, ctx?: LogContext) =>
    fnLogger.error(msg, fmt(ctx, {
      err: err instanceof Error
        ? { message: err.message, stack: err.stack, name: err.name }
        : err,
    })),
};
