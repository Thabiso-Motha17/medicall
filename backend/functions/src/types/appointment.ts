import type { Timestamp, GeoPoint } from "firebase-admin/firestore";

export type AppointmentStatus =
  | "requested"
  | "accepted"
  | "doctor_arriving"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface UserSummary {
  displayName: string;
  photoUrl: string | null;
}

export interface AppointmentAddress {
  line1: string;
  // Explicit `| undefined` so Zod's optional output (`line2?: string | undefined`)
  // stays assignable under `exactOptionalPropertyTypes: true`.
  line2?: string | undefined;
  city: string;
  postalCode: string;
  countryCode: string;
  geo: GeoPoint;
  geohash: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string | null;
  specialty: string;
  status: AppointmentStatus;

  patientSummary: UserSummary;
  doctorSummary: UserSummary | null;

  address: AppointmentAddress;

  priceCents: number;
  currency: string;
  paymentId: string | null;

  notes: string;

  // Timeline
  requestedAt: Timestamp;
  acceptedAt: Timestamp | null;
  arrivingAt: Timestamp | null;
  startedAt: Timestamp | null;
  completedAt: Timestamp | null;
  cancelledAt: Timestamp | null;
  cancellationReason: string | null;

  // Concurrency
  version: number;
  updatedAt: Timestamp;
}

export interface AppointmentStatusEvent {
  id: string;
  status: AppointmentStatus;
  actorUid: string;
  actorRole: "patient" | "doctor" | "admin" | "system";
  reason?: string;
  at: Timestamp;
}

export interface LocationPing {
  ts: Timestamp;
  geo: GeoPoint;
  speedMps: number | null;
  headingDeg: number | null;
}

/** Allowed status transitions, enforced server-side. */
export const ALLOWED_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  requested:        ["accepted", "cancelled"],
  accepted:         ["doctor_arriving", "cancelled"],
  doctor_arriving:  ["in_progress", "cancelled"],
  in_progress:      ["completed", "cancelled"],
  completed:        [],
  cancelled:        [],
};
