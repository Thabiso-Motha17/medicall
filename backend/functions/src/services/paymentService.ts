/**
 * Payment service — Stripe-ready. Card data never touches our backend;
 * we only persist Stripe ids and our own status mirror. Webhook is the
 * source of truth for status transitions.
 */
import Stripe from "stripe";
import { db, Timestamp } from "../config/firebase";
import { COLLECTIONS } from "../config/constants";
import { Errors } from "../lib/errors";
import { STRIPE_SECRET_KEY } from "../config/env";
import type { Appointment } from "../types/appointment";
import type { Payment } from "../types/payment";

let _stripe: Stripe | null = null;
function stripe(): Stripe {
  if (_stripe) return _stripe;
  _stripe = new Stripe(STRIPE_SECRET_KEY.value(), {
    apiVersion: "2024-09-30.acacia" as Stripe.LatestApiVersion,
    typescript: true,
  });
  return _stripe;
}

export interface CreateIntentResult {
  paymentId: string;
  clientSecret: string;
}

export async function createIntent(opts: {
  appointmentId: string;
  patientId: string;
}): Promise<CreateIntentResult> {
  const apptRef = db.collection(COLLECTIONS.appointments).doc(opts.appointmentId);
  const apptSnap = await apptRef.get();
  if (!apptSnap.exists) throw Errors.notFound("Appointment");

  const appt = apptSnap.data() as Appointment;
  if (appt.patientId !== opts.patientId) throw Errors.forbidden();
  if (!appt.doctorId) throw Errors.invalid("Appointment has no doctor yet");
  if (appt.paymentId) {
    // Reuse existing intent for idempotency.
    const existing = await db.collection(COLLECTIONS.payments).doc(appt.paymentId).get();
    const data = existing.data() as Payment | undefined;
    if (data) {
      const intent = await stripe().paymentIntents.retrieve(data.providerIntentId);
      return { paymentId: data.id, clientSecret: intent.client_secret ?? "" };
    }
  }

  const paymentRef = db.collection(COLLECTIONS.payments).doc();
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

  const payment: Payment = {
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
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const batch = db.batch();
  batch.set(paymentRef, payment);
  batch.update(apptRef, { paymentId: paymentRef.id, updatedAt: Timestamp.now() });
  await batch.commit();

  return { paymentId: paymentRef.id, clientSecret: intent.client_secret ?? "" };
}

/** Apply a verified Stripe webhook event. Idempotent on event.id. */
export async function applyStripeEvent(event: Stripe.Event): Promise<void> {
  const eventRef = db.collection("stripeEvents").doc(event.id);
  const seen = await eventRef.get();
  if (seen.exists) return;             // already processed

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const paymentId = intent.metadata.paymentId;
      if (!paymentId) break;
      await db.collection(COLLECTIONS.payments).doc(paymentId).update({
        status: "succeeded",
        providerChargeId: intent.latest_charge?.toString() ?? null,
        updatedAt: Timestamp.now(),
      });
      // Issue invoice (immutable)
      await db.collection(COLLECTIONS.invoices).add({
        paymentId,
        appointmentId: intent.metadata.appointmentId,
        patientId: intent.metadata.patientId,
        doctorId: intent.metadata.doctorId,
        amountCents: intent.amount,
        currency: intent.currency.toUpperCase(),
        pdfStoragePath: null,
        issuedAt: Timestamp.now(),
      });
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const paymentId = intent.metadata.paymentId;
      if (!paymentId) break;
      await db.collection(COLLECTIONS.payments).doc(paymentId).update({
        status: "failed",
        failureReason: intent.last_payment_error?.message ?? "unknown",
        updatedAt: Timestamp.now(),
      });
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentId = charge.metadata.paymentId;
      if (!paymentId) break;
      await db.collection(COLLECTIONS.payments).doc(paymentId).update({
        status: "refunded",
        updatedAt: Timestamp.now(),
      });
      break;
    }
    default:
      // Acknowledge unknown events without erroring — Stripe expects 2xx.
      break;
  }
  await eventRef.set({ type: event.type, processedAt: Timestamp.now() });
}

export function verifyStripeSignature(
  rawBody: Buffer,
  signature: string,
  secret: string,
): Stripe.Event {
  return stripe().webhooks.constructEvent(rawBody, signature, secret);
}
