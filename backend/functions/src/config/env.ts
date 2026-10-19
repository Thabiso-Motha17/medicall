/**
 * Environment & secrets — validated once at cold start.
 *
 * Runtime secrets are pulled from Firebase Secret Manager via
 * `defineSecret`. Non-secret config (region, project id) comes from
 * `process.env` (set by the runtime). We refuse to boot if anything is
 * missing — fail fast over silent misconfiguration.
 */
import { defineSecret, defineString } from "firebase-functions/params";
import { z } from "zod";

export const STRIPE_SECRET_KEY     = defineSecret("STRIPE_SECRET_KEY");
export const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");
export const SENTRY_DSN            = defineSecret("SENTRY_DSN");

export const REGION = defineString("REGION", { default: "us-central1" });

const RuntimeEnv = z.object({
  GCLOUD_PROJECT: z.string().min(1),
  FUNCTIONS_EMULATOR: z.string().optional(),
});

export const env = RuntimeEnv.parse(process.env);
export const isEmulator = env.FUNCTIONS_EMULATOR === "true";
