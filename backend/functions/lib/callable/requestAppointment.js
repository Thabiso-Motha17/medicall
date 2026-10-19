"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestAppointment = void 0;
const https_1 = require("firebase-functions/v2/https");
const env_1 = require("../config/env");
const requireAuth_1 = require("../middleware/requireAuth");
const requireRole_1 = require("../middleware/requireRole");
const withRateLimit_1 = require("../middleware/withRateLimit");
const validators_1 = require("../utils/validators");
const firebase_1 = require("../config/firebase");
const constants_1 = require("../config/constants");
const appointmentService = __importStar(require("../services/appointmentService"));
const doctorMatchingService_1 = require("../services/doctorMatchingService");
const notificationService_1 = require("../services/notificationService");
const logger_1 = require("../lib/logger");
const errors_1 = require("../lib/errors");
exports.requestAppointment = (0, https_1.onCall)({
    region: env_1.REGION,
    enforceAppCheck: true,
    cors: false,
    minInstances: 1,
    timeoutSeconds: 30,
    memory: "256MiB",
}, async (req) => {
    const ctx = (0, requireAuth_1.requireAuth)(req);
    (0, requireRole_1.requireRole)(ctx, "patient");
    const input = validators_1.RequestAppointmentInput.parse(req.data);
    await (0, withRateLimit_1.withRateLimit)(ctx.uid, "appointments_request", {
        capacity: constants_1.RATE_LIMITS.appointments_request.capacity,
        refillPerSecond: constants_1.RATE_LIMITS.appointments_request.refillPerHour / 3600,
    });
    try {
        const userSnap = await firebase_1.db.collection(constants_1.COLLECTIONS.users).doc(ctx.uid).get();
        const user = userSnap.data();
        if (!user)
            throw new https_1.HttpsError("not-found", "User profile missing");
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
            const candidates = await (0, doctorMatchingService_1.findCandidateDoctors)({
                specialty: input.specialty,
                center: input.address.geo,
                radiusMeters: 15_000,
                limit: 5,
            });
            await Promise.allSettled(candidates.map((c) => (0, notificationService_1.notifyUser)(c.doctor.uid, {
                title: "New house call request",
                body: `${input.specialty} · ~${Math.round(c.distanceMeters / 100) / 10}km away`,
                category: "appointment",
                data: { appointmentId: appt.id, type: "appointment.requested" },
            })));
        })();
        return { appointmentId: appt.id, status: appt.status };
    }
    catch (err) {
        if (err instanceof errors_1.AppError)
            throw err.toHttps();
        logger_1.logger.error("requestAppointment failed", err, { uid: ctx.uid, fn: "requestAppointment" });
        throw new https_1.HttpsError("internal", "Could not request appointment");
    }
});
//# sourceMappingURL=requestAppointment.js.map