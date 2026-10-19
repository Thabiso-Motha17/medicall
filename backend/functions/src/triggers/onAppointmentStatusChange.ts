import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { REGION } from "../config/env";
import { COLLECTIONS } from "../config/constants";
import { notifyUser } from "../services/notificationService";
import { logger } from "../lib/logger";
import type { Appointment, AppointmentStatus } from "../types/appointment";

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
export const onAppointmentStatusChange = onDocumentUpdated(
  {
    region: REGION,
    document: `${COLLECTIONS.appointments}/{appointmentId}`,
    retry: false,
  },
  async (event) => {
    const before = event.data?.before.data() as Appointment | undefined;
    const after  = event.data?.after.data()  as Appointment | undefined;
    if (!before || !after) return;
    if (before.status === after.status) return;     // not a status change

    try {
      await notifyOnTransition(after.status, after);
    } catch (err) {
      logger.error("onAppointmentStatusChange notify failed", err, {
        fn: "onAppointmentStatusChange", appointmentId: after.id,
      });
    }
  },
);

async function notifyOnTransition(status: AppointmentStatus, appt: Appointment) {
  const titles: Record<AppointmentStatus, { who: "patient" | "doctor"; title: string; body: string }> = {
    requested:        { who: "patient", title: "Searching for a doctor",  body: "Please wait, we are matching you." },
    accepted:         { who: "patient", title: "Doctor accepted",         body: `${appt.doctorSummary?.displayName ?? "Doctor"} is preparing.` },
    doctor_arriving:  { who: "patient", title: "Doctor is arriving",      body: "Your doctor is on the way." },
    in_progress:      { who: "patient", title: "Visit started",           body: "Your appointment has started." },
    completed:        { who: "patient", title: "Visit completed",         body: "Thank you. Please rate your doctor." },
    cancelled:        { who: "patient", title: "Appointment cancelled",   body: appt.cancellationReason ?? "" },
  };
  const t = titles[status];
  const target = t.who === "patient" ? appt.patientId : appt.doctorId;
  if (!target) return;
  await notifyUser(target, {
    title: t.title, body: t.body,
    category: "appointment",
    data: { appointmentId: appt.id, type: `appointment.${status}` },
  });
}
