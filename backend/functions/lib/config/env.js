"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmulator = exports.env = exports.REGION = exports.SENTRY_DSN = exports.STRIPE_WEBHOOK_SECRET = exports.STRIPE_SECRET_KEY = void 0;
/**
 * Environment & secrets — validated once at cold start.
 *
 * Runtime secrets are pulled from Firebase Secret Manager via
 * `defineSecret`. Non-secret config (region, project id) comes from
 * `process.env` (set by the runtime). We refuse to boot if anything is
 * missing — fail fast over silent misconfiguration.
 */
const params_1 = require("firebase-functions/params");
const zod_1 = require("zod");
exports.STRIPE_SECRET_KEY = (0, params_1.defineSecret)("STRIPE_SECRET_KEY");
exports.STRIPE_WEBHOOK_SECRET = (0, params_1.defineSecret)("STRIPE_WEBHOOK_SECRET");
exports.SENTRY_DSN = (0, params_1.defineSecret)("SENTRY_DSN");
exports.REGION = (0, params_1.defineString)("REGION", { default: "us-central1" });
const RuntimeEnv = zod_1.z.object({
    GCLOUD_PROJECT: zod_1.z.string().min(1),
    FUNCTIONS_EMULATOR: zod_1.z.string().optional(),
});
exports.env = RuntimeEnv.parse(process.env);
exports.isEmulator = exports.env.FUNCTIONS_EMULATOR === "true";
//# sourceMappingURL=env.js.map