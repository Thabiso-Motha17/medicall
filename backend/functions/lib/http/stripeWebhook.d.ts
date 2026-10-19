/**
 * Stripe webhook. MUST receive the raw request body (Functions v2 provides
 * `req.rawBody`). Verifies signature before doing any work.
 */
export declare const stripeWebhook: import("firebase-functions/v2/https").HttpsFunction;
