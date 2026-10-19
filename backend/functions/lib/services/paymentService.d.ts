/**
 * Payment service — Stripe-ready. Card data never touches our backend;
 * we only persist Stripe ids and our own status mirror. Webhook is the
 * source of truth for status transitions.
 */
import Stripe from "stripe";
export interface CreateIntentResult {
    paymentId: string;
    clientSecret: string;
}
export declare function createIntent(opts: {
    appointmentId: string;
    patientId: string;
}): Promise<CreateIntentResult>;
/** Apply a verified Stripe webhook event. Idempotent on event.id. */
export declare function applyStripeEvent(event: Stripe.Event): Promise<void>;
export declare function verifyStripeSignature(rawBody: Buffer, signature: string, secret: string): Stripe.Event;
