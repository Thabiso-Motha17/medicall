import { onCall, HttpsError } from "firebase-functions/v2/https";
import { REGION } from "../config/env";
import { requireAuth } from "../middleware/requireAuth";
import { requireVerifiedDoctor } from "../middleware/requireRole";
import { AcceptAppointmentInput } from "../utils/validators";
import { db, Timestamp } from "../config/firebase";
import { COLLECTIONS } from "../config/constants";
import * as appointmentService from "../services/appointmentService";
import { notifyUser } from "../services/notificationService";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";
import type { Appointment } from "../types/appointment";

export const acceptAppointment = onCall(
  { region: REGION, enforceAppCheck: true, timeoutSeconds: 15 },
  async (req) => {
    const ctx = requireAuth(req);
    requireVerifiedDoctor(ctx);

    const { appointmentId, expectedVersion } = AcceptAppointmentInput.parse(req.data);

    try {
      const docSnap = await db.collection(COLLECTIONS.users).doc(ctx.uid).get();
      const user = docSnap.data();
      if (!user) throw new HttpsError("not-found", "Doctor profile missing");

      const next = await appointmentService.transitionStatus({
        appointmentId,
        expectedVersion,
        next: "accepted",
        actorUid: ctx.uid,
        actorRole: "doctor",
        patch: {
          doctorId: ctx.uid,
          doctorSummary: { displayName: user.displayName, photoUrl: user.photoUrl ?? null },
        },
      });

      // Create chat thread (idempotent — id derived from appointment)
      await db.collection(COLLECTIONS.chatThreads).doc(`appt_${appointmentId}`).set({
        id: `appt_${appointmentId}`,
        appointmentId,
        participantIds: [next.patientId, ctx.uid],
        lastMessagePreview: "",
        lastMessageAt: null,
        lastSenderId: null,
        createdAt: Timestamp.now(),
      }, { merge: true });

      // Notify patient
      await notifyUser(next.patientId, {
        title: "Doctor on the way",
        body: `${user.displayName} accepted your request`,
        category: "appointment",
        data: { appointmentId, type: "appointment.accepted" },
      });

      return { status: next.status, version: next.version } satisfies Pick<Appointment, "status" | "version">;
    } catch (err) {
      if (err instanceof AppError) throw err.toHttps();
      if (err instanceof HttpsError) throw err;
      logger.error("acceptAppointment failed", err, { uid: ctx.uid, fn: "acceptAppointment" });
      throw new HttpsError("internal", "Could not accept appointment");
    }
  },
);
