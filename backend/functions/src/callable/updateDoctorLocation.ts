import { onCall, HttpsError } from "firebase-functions/v2/https";
import { REGION } from "../config/env";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";
import { withRateLimit } from "../middleware/withRateLimit";
import { UpdateLocationInput } from "../utils/validators";
import { db, Timestamp } from "../config/firebase";
import { COLLECTIONS, RATE_LIMITS, SUBCOLLECTIONS } from "../config/constants";
import { hashFor, pointFor } from "../lib/geohash";
import { logger } from "../lib/logger";
import { AppError } from "../lib/errors";

export const updateDoctorLocation = onCall(
  { region: REGION, enforceAppCheck: true, timeoutSeconds: 10, memory: "128MiB" },
  async (req) => {
    const ctx = requireAuth(req);
    requireRole(ctx, "doctor");

    const input = UpdateLocationInput.parse(req.data);
    await withRateLimit(ctx.uid, "location_update", {
      capacity: RATE_LIMITS.location_update.capacity,
      refillPerSecond: RATE_LIMITS.location_update.refillPerMinute / 60,
    });

    try {
      const geo = pointFor(input.geo.lat, input.geo.lng);
      const geohash = hashFor(input.geo.lat, input.geo.lng);
      const now = Timestamp.now();

      // Update doctor profile (single hot doc — once per few seconds is fine)
      await db.collection(COLLECTIONS.doctorProfiles).doc(ctx.uid).update({
        lastLocation: geo,
        geohash,
        lastSeenAt: now,
        isOnline: true,
      });

      // If on an active appointment, append a ping (TTL-cleaned subcollection)
      if (input.appointmentId) {
        const apptRef = db.collection(COLLECTIONS.appointments).doc(input.appointmentId);
        const snap = await apptRef.get();
        const appt = snap.data();
        if (appt && appt.doctorId === ctx.uid &&
            ["accepted", "doctor_arriving", "in_progress"].includes(appt.status)) {
          await apptRef.collection(SUBCOLLECTIONS.locationPings).doc(String(now.toMillis())).set({
            ts: now,
            geo,
            speedMps: input.speedMps ?? null,
            headingDeg: input.headingDeg ?? null,
          });
        }
      }
      return { ok: true };
    } catch (err) {
      if (err instanceof AppError) throw err.toHttps();
      logger.error("updateDoctorLocation failed", err, { uid: ctx.uid });
      throw new HttpsError("internal", "Could not update location");
    }
  },
);
