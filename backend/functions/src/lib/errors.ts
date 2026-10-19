/**
 * Typed application errors. Mapped to HttpsError at the function boundary
 * so callers receive a stable error shape instead of a stack trace.
 */
import { HttpsError, type FunctionsErrorCode } from "firebase-functions/v2/https";

export class AppError extends Error {
  constructor(
    public readonly code: FunctionsErrorCode,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
  toHttps(): HttpsError {
    return new HttpsError(this.code, this.message, this.details);
  }
}

export const Errors = {
  unauthenticated: (m = "Sign in required") =>
    new AppError("unauthenticated", m),
  forbidden: (m = "Not allowed") =>
    new AppError("permission-denied", m),
  notFound: (resource: string) =>
    new AppError("not-found", `${resource} not found`),
  invalid: (m: string, details?: Record<string, unknown>) =>
    new AppError("invalid-argument", m, details),
  conflict: (m: string) =>
    new AppError("aborted", m),
  rateLimited: (retryAfterSec: number) =>
    new AppError("resource-exhausted", "Rate limit exceeded", { retryAfterSec }),
  internal: (m = "Internal error") =>
    new AppError("internal", m),
};
