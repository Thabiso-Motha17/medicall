/**
 * Tree-shakeable function exports. Group them so deploy targeting works:
 *   firebase deploy --only functions:requestAppointment,functions:acceptAppointment
 */
export { requestAppointment } from "./callable/requestAppointment";
export { acceptAppointment } from "./callable/acceptAppointment";
export { updateDoctorLocation } from "./callable/updateDoctorLocation";
export { createPaymentIntent } from "./callable/createPaymentIntent";
export { verifyDoctor } from "./callable/verifyDoctor";
export { stripeWebhook } from "./http/stripeWebhook";
export { onUserCreate } from "./triggers/onUserCreate";
export { onAppointmentStatusChange } from "./triggers/onAppointmentStatusChange";
export { onChatMessageCreate } from "./triggers/onChatMessageCreate";
export { onDoctorDocumentUpload } from "./triggers/onDoctorDocumentUpload";
export { cleanupStaleAppointments } from "./scheduled/cleanupStaleAppointments";
export { recomputeDoctorRatings } from "./scheduled/recomputeDoctorRatings";
