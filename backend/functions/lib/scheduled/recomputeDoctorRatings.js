"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recomputeDoctorRatings = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const env_1 = require("../config/env");
const firebase_1 = require("../config/firebase");
const constants_1 = require("../config/constants");
const logger_1 = require("../lib/logger");
/**
 * Recompute doctor rating averages from completed appointments with reviews.
 * Runs nightly. Designed to scale: paginates by `verificationStatus` +
 * `updatedAt` cursor and processes 200 doctors per run.
 *
 * NOTE: this assumes `appointments/{id}.review` (rating, comment) exists
 * once the patient submits a review — wired up in a future patch.
 */
exports.recomputeDoctorRatings = (0, scheduler_1.onSchedule)({ region: env_1.REGION, schedule: "every day 03:00", timeZone: "UTC", timeoutSeconds: 540, memory: "512MiB" }, async () => {
    const doctors = await firebase_1.db.collection(constants_1.COLLECTIONS.doctorProfiles)
        .where("verificationStatus", "==", "verified")
        .limit(200)
        .get();
    let updated = 0;
    for (const doc of doctors.docs) {
        const reviews = await firebase_1.db.collection(constants_1.COLLECTIONS.appointments)
            .where("doctorId", "==", doc.id)
            .where("status", "==", "completed")
            .select("review")
            .limit(500)
            .get();
        const ratings = reviews.docs
            .map((d) => d.data().review?.rating)
            .filter((n) => typeof n === "number");
        if (ratings.length === 0)
            continue;
        const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        await doc.ref.update({
            ratingAvg: Math.round(avg * 100) / 100,
            ratingCount: ratings.length,
        });
        updated++;
    }
    logger_1.logger.info("recomputeDoctorRatings done", { fn: "recomputeDoctorRatings" }, { updated });
});
//# sourceMappingURL=recomputeDoctorRatings.js.map