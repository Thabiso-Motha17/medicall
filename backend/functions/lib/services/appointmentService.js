"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldValue = void 0;
exports.requestAppointment = requestAppointment;
exports.transitionStatus = transitionStatus;
exports.autoCancelStaleRequests = autoCancelStaleRequests;
const firebase_1 = require("../config/firebase");
Object.defineProperty(exports, "FieldValue", { enumerable: true, get: function () { return firebase_1.FieldValue; } });
const constants_1 = require("../config/constants");
const errors_1 = require("../lib/errors");
const geohash_1 = require("../lib/geohash");
const appointment_1 = require("../types/appointment");
const doctorMatchingService_1 = require("./doctorMatchingService");
const auditService_1 = require("./auditService");
async function requestAppointment(input) {
    // 1. Find candidate doctors first — fail fast if no one's around.
    const candidates = await (0, doctorMatchingService_1.findCandidateDoctors)({
        specialty: input.specialty,
        center: input.address.geo,
        radiusMeters: 15_000,
        limit: 5,
    });
    if (candidates.length === 0) {
        throw errors_1.Errors.notFound("No available doctors nearby");
    }
    const topDoctor = candidates[0].doctor;
    const ref = firebase_1.db.collection(constants_1.COLLECTIONS.appointments).doc();
    const now = firebase_1.Timestamp.now();
    // Firestore rejects explicit `undefined` values, so keep `line2` out of the
    // written document entirely when the patient didn't supply one.
    const { line2, ...addressRest } = input.address;
    const appointment = {
        id: ref.id,
        patientId: input.patientId,
        doctorId: null,
        specialty: input.specialty,
        status: "requested",
        patientSummary: input.patientSummary,
        doctorSummary: null,
        address: {
            ...addressRest,
            ...(line2 !== undefined ? { line2 } : {}),
            geo: (0, geohash_1.pointFor)(input.address.geo.lat, input.address.geo.lng),
            geohash: (0, geohash_1.hashFor)(input.address.geo.lat, input.address.geo.lng),
        },
        priceCents: topDoctor.consultationFeeCents,
        currency: topDoctor.currency,
        paymentId: null,
        notes: input.notes,
        requestedAt: now,
        acceptedAt: null,
        arrivingAt: null,
        startedAt: null,
        completedAt: null,
        cancelledAt: null,
        cancellationReason: null,
        version: 0,
        updatedAt: now,
    };
    const batch = firebase_1.db.batch();
    batch.set(ref, appointment);
    batch.set(ref.collection(constants_1.SUBCOLLECTIONS.statusEvents).doc(), {
        status: "requested",
        actorUid: input.patientId,
        actorRole: "patient",
        at: now,
    });
    await batch.commit();
    // Caller (callable) is responsible for fanning out push notifications
    // to candidate doctors via notificationService.
    return appointment;
}
/**
 * Atomic, audited status transition with optimistic concurrency.
 * Throws on illegal transition or version mismatch.
 */
async function transitionStatus(input) {
    const ref = firebase_1.db.collection(constants_1.COLLECTIONS.appointments).doc(input.appointmentId);
    return firebase_1.db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists)
            throw errors_1.Errors.notFound("Appointment");
        const current = snap.data();
        if (current.version !== input.expectedVersion) {
            throw errors_1.Errors.conflict("Appointment was modified by another request");
        }
        if (!appointment_1.ALLOWED_TRANSITIONS[current.status].includes(input.next)) {
            throw errors_1.Errors.invalid(`Illegal transition ${current.status} → ${input.next}`);
        }
        const now = firebase_1.Timestamp.now();
        const stamp = { status: input.next, updatedAt: now };
        switch (input.next) {
            case "accepted":
                stamp.acceptedAt = now;
                break;
            case "doctor_arriving":
                stamp.arrivingAt = now;
                break;
            case "in_progress":
                stamp.startedAt = now;
                break;
            case "completed":
                stamp.completedAt = now;
                break;
            case "cancelled":
                stamp.cancelledAt = now;
                stamp.cancellationReason = input.reason ?? null;
                break;
        }
        const next = {
            ...current,
            ...stamp,
            ...(input.patch ?? {}),
            version: current.version + 1,
        };
        tx.set(ref, next);
        tx.set(ref.collection(constants_1.SUBCOLLECTIONS.statusEvents).doc(), {
            status: input.next,
            actorUid: input.actorUid,
            actorRole: input.actorRole,
            reason: input.reason ?? null,
            at: now,
        });
        return next;
    }).then(async (next) => {
        await (0, auditService_1.recordAudit)({
            action: `appointment.${input.next}`,
            actorUid: input.actorUid,
            actorRole: input.actorRole,
            targetType: "appointment",
            targetId: input.appointmentId,
        });
        return next;
    });
}
/** Cancel any appointment older than the timeout that's still "requested". */
async function autoCancelStaleRequests() {
    const now = firebase_1.Timestamp.now();
    const cutoff = firebase_1.Timestamp.fromMillis(Date.now() - constants_1.DEFAULTS.appointmentTimeoutMinutes * 60_000);
    const stale = await firebase_1.db.collection(constants_1.COLLECTIONS.appointments)
        .where("status", "==", "requested")
        .where("requestedAt", "<", cutoff)
        .limit(100)
        .get();
    if (stale.empty)
        return 0;
    const batch = firebase_1.db.batch();
    for (const doc of stale.docs) {
        const data = doc.data();
        batch.update(doc.ref, {
            status: "cancelled",
            cancelledAt: now,
            cancellationReason: "timeout_no_doctor",
            version: data.version + 1,
            updatedAt: now,
        });
        batch.set(doc.ref.collection(constants_1.SUBCOLLECTIONS.statusEvents).doc(), {
            status: "cancelled",
            actorUid: "system",
            actorRole: "system",
            reason: "timeout_no_doctor",
            at: now,
        });
    }
    await batch.commit();
    return stale.size;
}
//# sourceMappingURL=appointmentService.js.map