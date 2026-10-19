import { onCall, HttpsError } from "firebase-functions/v2/https";
import { REGION } from "../config/env";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";
import { withRateLimit } from "../middleware/withRateLimit";
import { RequestAppointmentInput } from "../utils/validators";
import { db } from "../config/firebase";
import { COLLECTIONS, RATE_LIMITS } from "../config/constants";
import * as appointmentService from "../services/appointmentService";
import { findCandidateDoctors } from "../services/doctorMatchingService";
import { notifyUser } from "../services/notificationService";
import { logger } from "../lib/logger";
import { AppError } from "../lib/errors";

export const requestAppointment = onCall(
  {
    region: REGION,
    enforceAppCheck: true,
    cors: false,
    minInstances: 1,
    timeoutSeconds: 30,
    memory: "256MiB",
  },
  async (req) => {
    const ctx = requireAuth(req);
    requireRole(ctx, "patient");

    const input = RequestAppointmentInput.parse(req.data);
    await withRateLimit(ctx.uid, "appointments_request", {
      capacity: RATE_LIMITS.appointments_request.capacity,
      refillPerSecond:
        RATE_LIMITS.appointments_request.refillPerHour / 3600,
    });

    try {
      const userSnap = await db.collection(COLLECTIONS.users).doc(ctx.uid).get();
      const user = userSnap.data();
      if (!user) throw new HttpsError("not-found", "User profile missing");

      const appt = await appointmentService.requestAppointment({
        patientId: ctx.uid,
        specialty: input.specialty,
        address: input.address,
        notes: input.notes,
        patientSummary: {
          displayName: user.displayName,
          photoUrl: user.photoUrl ?? null,
        },
      });

      // Fan out to top candidates (best-effort, don't block response)
      void (async () => {
        const candidates = await findCandidateDoctors({
          specialty: input.specialty,
          center: input.address.geo,
          radiusMeters: 15_000,
          limit: 5,
        });
        await Promise.allSettled(candidates.map((c) =>
          notifyUser(c.doctor.uid, {
            title: "New house call request",
            body: `${input.specialty} · ~${Math.round(c.distanceMeters / 100) / 10}km away`,
            category: "appointment",
            data: { appointmentId: appt.id, type: "appointment.requested" },
          }),
        ));
      })();

      return { appointmentId: appt.id, status: appt.status };
    } catch (err) {
      if (err instanceof AppError) throw err.toHttps();
      logger.error("requestAppointment failed", err, { uid: ctx.uid, fn: "requestAppointment" });
      throw new HttpsError("internal", "Could not request appointment");
    }
  },
);
