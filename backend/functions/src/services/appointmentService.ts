import { db, FieldValue, Timestamp } from "../config/firebase";
import { COLLECTIONS, DEFAULTS, SUBCOLLECTIONS } from "../config/constants";
import { Errors } from "../lib/errors";
import { hashFor, pointFor } from "../lib/geohash";
import {
  ALLOWED_TRANSITIONS,
  type Appointment, type AppointmentStatus, type AppointmentAddress,
} from "../types/appointment";
import { findCandidateDoctors } from "./doctorMatchingService";
import { recordAudit } from "./auditService";

interface RequestInput {
  patientId: string;
  specialty: string;
  address: Omit<AppointmentAddress, "geo" | "geohash"> & {
    geo: { lat: number; lng: number };
  };
  notes: string;
  patientSummary: { displayName: string; photoUrl: string | null };
}

export async function requestAppointment(input: RequestInput): Promise<Appointment> {
  // 1. Find candidate doctors first — fail fast if no one's around.
  const candidates = await findCandidateDoctors({
    specialty: input.specialty,
    center: input.address.geo,
    radiusMeters: 15_000,
    limit: 5,
  });
  if (candidates.length === 0) {
    throw Errors.notFound("No available doctors nearby");
  }

  const topDoctor = candidates[0]!.doctor;
  const ref = db.collection(COLLECTIONS.appointments).doc();
  const now = Timestamp.now();

  // Firestore rejects explicit `undefined` values, so keep `line2` out of the
  // written document entirely when the patient didn't supply one.
  const { line2, ...addressRest } = input.address;

  const appointment: Appointment = {
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
      geo: pointFor(input.address.geo.lat, input.address.geo.lng),
      geohash: hashFor(input.address.geo.lat, input.address.geo.lng),
    },
    priceCents: topDoctor.consultationFeeCents,
    currency:   topDoctor.currency,
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

  const batch = db.batch();
  batch.set(ref, appointment);
  batch.set(ref.collection(SUBCOLLECTIONS.statusEvents).doc(), {
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

export interface TransitionInput {
  appointmentId: string;
  expectedVersion: number;
  next: AppointmentStatus;
  actorUid: string;
  actorRole: "patient" | "doctor" | "admin" | "system";
  patch?: Partial<Appointment>;
  reason?: string;
}

/**
 * Atomic, audited status transition with optimistic concurrency.
 * Throws on illegal transition or version mismatch.
 */
export async function transitionStatus(input: TransitionInput): Promise<Appointment> {
  const ref = db.collection(COLLECTIONS.appointments).doc(input.appointmentId);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw Errors.notFound("Appointment");
    const current = snap.data() as Appointment;

    if (current.version !== input.expectedVersion) {
      throw Errors.conflict("Appointment was modified by another request");
    }
    if (!ALLOWED_TRANSITIONS[current.status].includes(input.next)) {
      throw Errors.invalid(
        `Illegal transition ${current.status} → ${input.next}`,
      );
    }

    const now = Timestamp.now();
    const stamp: Partial<Appointment> = { status: input.next, updatedAt: now };
    switch (input.next) {
      case "accepted":        stamp.acceptedAt  = now; break;
      case "doctor_arriving": stamp.arrivingAt  = now; break;
      case "in_progress":     stamp.startedAt   = now; break;
      case "completed":       stamp.completedAt = now; break;
      case "cancelled":
        stamp.cancelledAt = now;
        stamp.cancellationReason = input.reason ?? null;
        break;
    }

    const next: Appointment = {
      ...current,
      ...stamp,
      ...(input.patch ?? {}),
      version: current.version + 1,
    };
    tx.set(ref, next);
    tx.set(ref.collection(SUBCOLLECTIONS.statusEvents).doc(), {
      status: input.next,
      actorUid: input.actorUid,
      actorRole: input.actorRole,
      reason: input.reason ?? null,
      at: now,
    });
    return next;
  }).then(async (next) => {
    await recordAudit({
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
export async function autoCancelStaleRequests(): Promise<number> {
  const now = Timestamp.now();
  const cutoff = Timestamp.fromMillis(
    Date.now() - DEFAULTS.appointmentTimeoutMinutes * 60_000,
  );
  const stale = await db.collection(COLLECTIONS.appointments)
    .where("status", "==", "requested")
    .where("requestedAt", "<", cutoff)
    .limit(100)
    .get();

  if (stale.empty) return 0;
  const batch = db.batch();
  for (const doc of stale.docs) {
    const data = doc.data() as Appointment;
    batch.update(doc.ref, {
      status: "cancelled",
      cancelledAt: now,
      cancellationReason: "timeout_no_doctor",
      version: data.version + 1,
      updatedAt: now,
    });
    batch.set(doc.ref.collection(SUBCOLLECTIONS.statusEvents).doc(), {
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

// re-export to satisfy unused-import lints in callers
export { FieldValue };
