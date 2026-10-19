/**
 * Side-effects on appointment status change:
 *  - notify the other party
 *  - (future) trigger payment capture on `completed`
 *  - (future) release doctor's `isAcceptingRequests` on terminal states
 *
 * The status TRANSITION itself is enforced server-side in
 * appointmentService.transitionStatus — this trigger is purely for
 * fan-out, so it must remain idempotent.
 */
export declare const onAppointmentStatusChange: import("firebase-functions/core").CloudFunction<import("firebase-functions/v2/firestore").FirestoreEvent<import("firebase-functions/v2/firestore").Change<import("firebase-functions/v2/firestore").QueryDocumentSnapshot> | undefined, {
    appointmentId: string;
}>>;
