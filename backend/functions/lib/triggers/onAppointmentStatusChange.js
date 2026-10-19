"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onAppointmentStatusChange = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const env_1 = require("../config/env");
const constants_1 = require("../config/constants");
const notificationService_1 = require("../services/notificationService");
const logger_1 = require("../lib/logger");
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
exports.onAppointmentStatusChange = (0, firestore_1.onDocumentUpdated)({
    region: env_1.REGION,
    document: `${constants_1.COLLECTIONS.appointments}/{appointmentId}`,
    retry: false,
}, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after)
        return;
    if (before.status === after.status)
        return; // not a status change
    try {
        await notifyOnTransition(after.status, after);
    }
    catch (err) {
        logger_1.logger.error("onAppointmentStatusChange notify failed", err, {
            fn: "onAppointmentStatusChange", appointmentId: after.id,
        });
    }
});
async function notifyOnTransition(status, appt) {
    const titles = {
        requested: { who: "patient", title: "Searching for a doctor", body: "Please wait, we are matching you." },
        accepted: { who: "patient", title: "Doctor accepted", body: `${appt.doctorSummary?.displayName ?? "Doctor"} is preparing.` },
        doctor_arriving: { who: "patient", title: "Doctor is arriving", body: "Your doctor is on the way." },
        in_progress: { who: "patient", title: "Visit started", body: "Your appointment has started." },
        completed: { who: "patient", title: "Visit completed", body: "Thank you. Please rate your doctor." },
        cancelled: { who: "patient", title: "Appointment cancelled", body: appt.cancellationReason ?? "" },
    };
    const t = titles[status];
    const target = t.who === "patient" ? appt.patientId : appt.doctorId;
    if (!target)
        return;
    await (0, notificationService_1.notifyUser)(target, {
        title: t.title, body: t.body,
        category: "appointment",
        data: { appointmentId: appt.id, type: `appointment.${status}` },
    });
}
//# sourceMappingURL=onAppointmentStatusChange.js.map