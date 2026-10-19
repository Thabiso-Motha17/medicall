/**
 * Typed application errors. Mapped to HttpsError at the function boundary
 * so callers receive a stable error shape instead of a stack trace.
 */
import { HttpsError, type FunctionsErrorCode } from "firebase-functions/v2/https";
export declare class AppError extends Error {
    readonly code: FunctionsErrorCode;
    readonly details?: Record<string, unknown> | undefined;
    constructor(code: FunctionsErrorCode, message: string, details?: Record<string, unknown> | undefined);
    toHttps(): HttpsError;
}
export declare const Errors: {
    unauthenticated: (m?: string) => AppError;
    forbidden: (m?: string) => AppError;
    notFound: (resource: string) => AppError;
    invalid: (m: string, details?: Record<string, unknown>) => AppError;
    conflict: (m: string) => AppError;
    rateLimited: (retryAfterSec: number) => AppError;
    internal: (m?: string) => AppError;
};
