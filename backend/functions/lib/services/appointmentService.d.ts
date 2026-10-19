import { FieldValue } from "../config/firebase";
import { type Appointment, type AppointmentStatus, type AppointmentAddress } from "../types/appointment";
interface RequestInput {
    patientId: string;
    specialty: string;
    address: Omit<AppointmentAddress, "geo" | "geohash"> & {
        geo: {
            lat: number;
            lng: number;
        };
    };
    notes: string;
    patientSummary: {
        displayName: string;
        photoUrl: string | null;
    };
}
export declare function requestAppointment(input: RequestInput): Promise<Appointment>;
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
export declare function transitionStatus(input: TransitionInput): Promise<Appointment>;
/** Cancel any appointment older than the timeout that's still "requested". */
export declare function autoCancelStaleRequests(): Promise<number>;
export { FieldValue };
