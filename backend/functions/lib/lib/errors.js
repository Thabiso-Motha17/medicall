"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = exports.AppError = void 0;
/**
 * Typed application errors. Mapped to HttpsError at the function boundary
 * so callers receive a stable error shape instead of a stack trace.
 */
const https_1 = require("firebase-functions/v2/https");
class AppError extends Error {
    code;
    details;
    constructor(code, message, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = "AppError";
    }
    toHttps() {
        return new https_1.HttpsError(this.code, this.message, this.details);
    }
}
exports.AppError = AppError;
exports.Errors = {
    unauthenticated: (m = "Sign in required") => new AppError("unauthenticated", m),
    forbidden: (m = "Not allowed") => new AppError("permission-denied", m),
    notFound: (resource) => new AppError("not-found", `${resource} not found`),
    invalid: (m, details) => new AppError("invalid-argument", m, details),
    conflict: (m) => new AppError("aborted", m),
    rateLimited: (retryAfterSec) => new AppError("resource-exhausted", "Rate limit exceeded", { retryAfterSec }),
    internal: (m = "Internal error") => new AppError("internal", m),
};
//# sourceMappingURL=errors.js.map