/**
 * Recompute doctor rating averages from completed appointments with reviews.
 * Runs nightly. Designed to scale: paginates by `verificationStatus` +
 * `updatedAt` cursor and processes 200 doctors per run.
 *
 * NOTE: this assumes `appointments/{id}.review` (rating, comment) exists
 * once the patient submits a review — wired up in a future patch.
 */
export declare const recomputeDoctorRatings: import("firebase-functions/v2/scheduler").ScheduleFunction;
