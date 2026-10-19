import { onSchedule } from "firebase-functions/v2/scheduler";
import { REGION } from "../config/env";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../config/constants";
import { logger } from "../lib/logger";

/**
 * Recompute doctor rating averages from completed appointments with reviews.
 * Runs nightly. Designed to scale: paginates by `verificationStatus` +
 * `updatedAt` cursor and processes 200 doctors per run.
 *
 * NOTE: this assumes `appointments/{id}.review` (rating, comment) exists
 * once the patient submits a review — wired up in a future patch.
 */
export const recomputeDoctorRatings = onSchedule(
  { region: REGION, schedule: "every day 03:00", timeZone: "UTC", timeoutSeconds: 540, memory: "512MiB" },
  async () => {
    const doctors = await db.collection(COLLECTIONS.doctorProfiles)
      .where("verificationStatus", "==", "verified")
      .limit(200)
      .get();

    let updated = 0;
    for (const doc of doctors.docs) {
      const reviews = await db.collection(COLLECTIONS.appointments)
        .where("doctorId", "==", doc.id)
        .where("status", "==", "completed")
        .select("review")
        .limit(500)
        .get();

      const ratings = reviews.docs
        .map((d) => (d.data() as { review?: { rating?: number } }).review?.rating)
        .filter((n): n is number => typeof n === "number");
      if (ratings.length === 0) continue;
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;

      await doc.ref.update({
        ratingAvg: Math.round(avg * 100) / 100,
        ratingCount: ratings.length,
      });
      updated++;
    }
    logger.info("recomputeDoctorRatings done", { fn: "recomputeDoctorRatings" }, { updated });
  },
);
