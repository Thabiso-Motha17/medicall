"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIntent = createIntent;
exports.applyStripeEvent = applyStripeEvent;
exports.verifyStripeSignature = verifyStripeSignature;
/**
 * Payment service — Stripe-ready. Card data never touches our backend;
 * we only persist Stripe ids and our own status mirror. Webhook is the
 * source of truth for status transitions.
 */
const stripe_1 = __importDefault(require("stripe"));
const firebase_1 = require("../config/firebase");
const constants_1 = require("../config/constants");
const errors_1 = require("../lib/errors");
const env_1 = require("../config/env");
let _stripe = null;
function stripe() {
    if (_stripe)
        return _stripe;
    _stripe = new stripe_1.default(env_1.STRIPE_SECRET_KEY.value(), {
        apiVersion: "2024-09-30.acacia",
        typescript: true,
    });
    return _stripe;
}
async function createIntent(opts) {
    const apptRef = firebase_1.db.collection(constants_1.COLLECTIONS.appointments).doc(opts.appointmentId);
    const apptSnap = await apptRef.get();
    if (!apptSnap.exists)
        throw errors_1.Errors.notFound("Appointment");
    const appt = apptSnap.data();
    if (appt.patientId !== opts.patientId)
        throw errors_1.Errors.forbidden();
    if (!appt.doctorId)
        throw errors_1.Errors.invalid("Appointment has no doctor yet");
    if (appt.paymentId) {
        // Reuse existing intent for idempotency.
        const existing = await firebase_1.db.collection(constants_1.COLLECTIONS.payments).doc(appt.paymentId).get();
        const data = existing.data();
        if (data) {
            const intent = await stripe().paymentIntents.retrieve(data.providerIntentId);
            return { paymentId: data.id, clientSecret: intent.client_secret ?? "" };
        }
    }
    const paymentRef = firebase_1.db.collection(constants_1.COLLECTIONS.payments).doc();
    const intent = await stripe().paymentIntents.create({
        amount: appt.priceCents,
        currency: appt.currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: {
            appointmentId: appt.id,
            patientId: appt.patientId,
            doctorId: appt.doctorId,
            paymentId: paymentRef.id,
        },
    }, { idempotencyKey: `intent_${appt.id}` });
    const payment = {
        id: paymentRef.id,
        appointmentId: appt.id,
        patientId: appt.patientId,
        doctorId: appt.doctorId,
        amountCents: appt.priceCents,
        currency: appt.currency,
        status: "requires_action",
        provider: "stripe",
        providerIntentId: intent.id,
        providerChargeId: null,
        failureReason: null,
        createdAt: firebase_1.Timestamp.now(),
        updatedAt: firebase_1.Timestamp.now(),
    };
    const batch = firebase_1.db.batch();
    batch.set(paymentRef, payment);
    batch.update(apptRef, { paymentId: paymentRef.id, updatedAt: firebase_1.Timestamp.now() });
    await batch.commit();
    return { paymentId: paymentRef.id, clientSecret: intent.client_secret ?? "" };
}
/** Apply a verified Stripe webhook event. Idempotent on event.id. */
async function applyStripeEvent(event) {
    const eventRef = firebase_1.db.collection("stripeEvents").doc(event.id);
    const seen = await eventRef.get();
    if (seen.exists)
        return; // already processed
    switch (event.type) {
        case "payment_intent.succeeded": {
            const intent = event.data.object;
            const paymentId = intent.metadata.paymentId;
            if (!paymentId)
                break;
            await firebase_1.db.collection(constants_1.COLLECTIONS.payments).doc(paymentId).update({
                status: "succeeded",
                providerChargeId: intent.latest_charge?.toString() ?? null,
                updatedAt: firebase_1.Timestamp.now(),
            });
            // Issue invoice (immutable)
            await firebase_1.db.collection(constants_1.COLLECTIONS.invoices).add({
                paymentId,
                appointmentId: intent.metadata.appointmentId,
                patientId: intent.metadata.patientId,
                doctorId: intent.metadata.doctorId,
                amountCents: intent.amount,
                currency: intent.currency.toUpperCase(),
                pdfStoragePath: null,
                issuedAt: firebase_1.Timestamp.now(),
            });
            break;
        }
        case "payment_intent.payment_failed": {
            const intent = event.data.object;
            const paymentId = intent.metadata.paymentId;
            if (!paymentId)
                break;
            await firebase_1.db.collection(constants_1.COLLECTIONS.payments).doc(paymentId).update({
                status: "failed",
                failureReason: intent.last_payment_error?.message ?? "unknown",
                updatedAt: firebase_1.Timestamp.now(),
            });
            break;
        }
        case "charge.refunded": {
            const charge = event.data.object;
            const paymentId = charge.metadata.paymentId;
            if (!paymentId)
                break;
            await firebase_1.db.collection(constants_1.COLLECTIONS.payments).doc(paymentId).update({
                status: "refunded",
                updatedAt: firebase_1.Timestamp.now(),
            });
            break;
        }
        default:
            // Acknowledge unknown events without erroring — Stripe expects 2xx.
            break;
    }
    await eventRef.set({ type: event.type, processedAt: firebase_1.Timestamp.now() });
}
function verifyStripeSignature(rawBody, signature, secret) {
    return stripe().webhooks.constructEvent(rawBody, signature, secret);
}
//# sourceMappingURL=paymentService.js.map