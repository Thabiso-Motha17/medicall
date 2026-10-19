import { onCall, HttpsError } from "firebase-functions/v2/https";
import { REGION, STRIPE_SECRET_KEY } from "../config/env";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";
import { CreatePaymentIntentInput } from "../utils/validators";
import * as paymentService from "../services/paymentService";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";

export const createPaymentIntent = onCall(
  {
    region: REGION,
    enforceAppCheck: true,
    secrets: [STRIPE_SECRET_KEY],
    timeoutSeconds: 20,
  },
  async (req) => {
    const ctx = requireAuth(req);
    requireRole(ctx, "patient");

    const { appointmentId } = CreatePaymentIntentInput.parse(req.data);
    try {
      return await paymentService.createIntent({
        appointmentId, patientId: ctx.uid,
      });
    } catch (err) {
      if (err instanceof AppError) throw err.toHttps();
      logger.error("createPaymentIntent failed", err, { uid: ctx.uid });
      throw new HttpsError("internal", "Could not create payment intent");
    }
  },
);
