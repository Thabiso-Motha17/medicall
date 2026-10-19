import { onRequest } from "firebase-functions/v2/https";
import { REGION, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from "../config/env";
import * as paymentService from "../services/paymentService";
import { logger } from "../lib/logger";

/**
 * Stripe webhook. MUST receive the raw request body (Functions v2 provides
 * `req.rawBody`). Verifies signature before doing any work.
 */
export const stripeWebhook = onRequest(
  {
    region: REGION,
    secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET],
    invoker: "public",     // webhook called by Stripe — auth via signature
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (req, res) => {
    if (req.method !== "POST") { res.status(405).send("method not allowed"); return; }
    const sig = req.headers["stripe-signature"];
    if (typeof sig !== "string") { res.status(400).send("missing signature"); return; }

    let event;
    try {
      event = paymentService.verifyStripeSignature(
        req.rawBody, sig, STRIPE_WEBHOOK_SECRET.value(),
      );
    } catch (err) {
      logger.warn("stripe signature failed", { fn: "stripeWebhook" }, { err: String(err) });
      res.status(400).send("invalid signature");
      return;
    }

    try {
      await paymentService.applyStripeEvent(event);
      res.status(200).json({ received: true });
    } catch (err) {
      logger.error("stripe handler failed", err, { fn: "stripeWebhook" });
      // Return 500 so Stripe retries
      res.status(500).send("handler error");
    }
  },
);
