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
exports.acceptAppointment = void 0;
const https_1 = require("firebase-functions/v2/https");
const env_1 = require("../config/env");
const requireAuth_1 = require("../middleware/requireAuth");
const requireRole_1 = require("../middleware/requireRole");
const validators_1 = require("../utils/validators");
const firebase_1 = require("../config/firebase");
const constants_1 = require("../config/constants");
const appointmentService = __importStar(require("../services/appointmentService"));
const notificationService_1 = require("../services/notificationService");
const errors_1 = require("../lib/errors");
const logger_1 = require("../lib/logger");
exports.acceptAppointment = (0, https_1.onCall)({ region: env_1.REGION, enforceAppCheck: true, timeoutSeconds: 15 }, async (req) => {
    const ctx = (0, requireAuth_1.requireAuth)(req);
    (0, requireRole_1.requireVerifiedDoctor)(ctx);
    const { appointmentId, expectedVersion } = validators_1.AcceptAppointmentInput.parse(req.data);
    try {
        const docSnap = await firebase_1.db.collection(constants_1.COLLECTIONS.users).doc(ctx.uid).get();
        const user = docSnap.data();
        if (!user)
            throw new https_1.HttpsError("not-found", "Doctor profile missing");
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
        await firebase_1.db.collection(constants_1.COLLECTIONS.chatThreads).doc(`appt_${appointmentId}`).set({
            id: `appt_${appointmentId}`,
            appointmentId,
            participantIds: [next.patientId, ctx.uid],
            lastMessagePreview: "",
            lastMessageAt: null,
            lastSenderId: null,
            createdAt: firebase_1.Timestamp.now(),
        }, { merge: true });
        // Notify patient
        await (0, notificationService_1.notifyUser)(next.patientId, {
            title: "Doctor on the way",
            body: `${user.displayName} accepted your request`,
            category: "appointment",
            data: { appointmentId, type: "appointment.accepted" },
        });
        return { status: next.status, version: next.version };
    }
    catch (err) {
        if (err instanceof errors_1.AppError)
            throw err.toHttps();
        if (err instanceof https_1.HttpsError)
            throw err;
        logger_1.logger.error("acceptAppointment failed", err, { uid: ctx.uid, fn: "acceptAppointment" });
        throw new https_1.HttpsError("internal", "Could not accept appointment");
    }
});
//# sourceMappingURL=acceptAppointment.js.map