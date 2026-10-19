"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDoctorLocation = void 0;
const https_1 = require("firebase-functions/v2/https");
const env_1 = require("../config/env");
const requireAuth_1 = require("../middleware/requireAuth");
const requireRole_1 = require("../middleware/requireRole");
const withRateLimit_1 = require("../middleware/withRateLimit");
const validators_1 = require("../utils/validators");
const firebase_1 = require("../config/firebase");
const constants_1 = require("../config/constants");
const geohash_1 = require("../lib/geohash");
const logger_1 = require("../lib/logger");
const errors_1 = require("../lib/errors");
exports.updateDoctorLocation = (0, https_1.onCall)({ region: env_1.REGION, enforceAppCheck: true, timeoutSeconds: 10, memory: "128MiB" }, async (req) => {
    const ctx = (0, requireAuth_1.requireAuth)(req);
    (0, requireRole_1.requireRole)(ctx, "doctor");
    const input = validators_1.UpdateLocationInput.parse(req.data);
    await (0, withRateLimit_1.withRateLimit)(ctx.uid, "location_update", {
        capacity: constants_1.RATE_LIMITS.location_update.capacity,
        refillPerSecond: constants_1.RATE_LIMITS.location_update.refillPerMinute / 60,
    });
    try {
        const geo = (0, geohash_1.pointFor)(input.geo.lat, input.geo.lng);
        const geohash = (0, geohash_1.hashFor)(input.geo.lat, input.geo.lng);
        const now = firebase_1.Timestamp.now();
        // Update doctor profile (single hot doc — once per few seconds is fine)
        await firebase_1.db.collection(constants_1.COLLECTIONS.doctorProfiles).doc(ctx.uid).update({
            lastLocation: geo,
            geohash,
            lastSeenAt: now,
            isOnline: true,
        });
        // If on an active appointment, append a ping (TTL-cleaned subcollection)
        if (input.appointmentId) {
            const apptRef = firebase_1.db.collection(constants_1.COLLECTIONS.appointments).doc(input.appointmentId);
            const snap = await apptRef.get();
            const appt = snap.data();
            if (appt && appt.doctorId === ctx.uid &&
                ["accepted", "doctor_arriving", "in_progress"].includes(appt.status)) {
                await apptRef.collection(constants_1.SUBCOLLECTIONS.locationPings).doc(String(now.toMillis())).set({
                    ts: now,
                    geo,
                    speedMps: input.speedMps ?? null,
                    headingDeg: input.headingDeg ?? null,
                });
            }
        }
        return { ok: true };
    }
    catch (err) {
        if (err instanceof errors_1.AppError)
            throw err.toHttps();
        logger_1.logger.error("updateDoctorLocation failed", err, { uid: ctx.uid });
        throw new https_1.HttpsError("internal", "Could not update location");
    }
});
//# sourceMappingURL=updateDoctorLocation.js.map