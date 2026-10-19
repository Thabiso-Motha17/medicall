import { onCall, HttpsError } from "firebase-functions/v2/https";
import { REGION } from "../config/env";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";
import { VerifyDoctorInput } from "../utils/validators";
import { auth, db, Timestamp } from "../config/firebase";
import { COLLECTIONS } from "../config/constants";
import { recordAudit } from "../services/auditService";
import { notifyUser } from "../services/notificationService";
import { logger } from "../lib/logger";

export const verifyDoctor = onCall(
  { region: REGION, enforceAppCheck: true, timeoutSeconds: 15 },
  async (req) => {
    const ctx = requireAuth(req);
    requireRole(ctx, "admin");

    const input = VerifyDoctorInput.parse(req.data);
    try {
      const ref = db.collection(COLLECTIONS.doctorProfiles).doc(input.doctorUid);
      const snap = await ref.get();
      if (!snap.exists) throw new HttpsError("not-found", "Doctor not found");

      await ref.update({
        verificationStatus: input.decision,
        verifiedAt: input.decision === "verified" ? Timestamp.now() : null,
        updatedAt: Timestamp.now(),
      });

      // Mirror into custom claim so security rules can use it cheaply.
      const existing = (await auth.getUser(input.doctorUid)).customClaims ?? {};
      await auth.setCustomUserClaims(input.doctorUid, {
        ...existing,
        role: "doctor",
        verified: input.decision === "verified",
      });

      await recordAudit({
        action: `doctor.${input.decision}`,
        actorUid: ctx.uid,
        actorRole: "admin",
        targetType: "doctor",
        targetId: input.doctorUid,
        metadata: input.reason ? { reason: input.reason } : {},
      });

      await notifyUser(input.doctorUid, {
        title: input.decision === "verified" ? "Verification approved" : "Verification update",
        body: input.decision === "verified"
          ? "You can now accept house call requests."
          : `Your application was not approved. ${input.reason ?? ""}`.trim(),
        category: "system",
        data: { type: `doctor.${input.decision}` },
      });

      return { ok: true, refreshToken: true };
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      logger.error("verifyDoctor failed", err, { uid: ctx.uid });
      throw new HttpsError("internal", "Could not verify doctor");
    }
  },
);
