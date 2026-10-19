"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyDoctor = void 0;
const https_1 = require("firebase-functions/v2/https");
const env_1 = require("../config/env");
const requireAuth_1 = require("../middleware/requireAuth");
const requireRole_1 = require("../middleware/requireRole");
const validators_1 = require("../utils/validators");
const firebase_1 = require("../config/firebase");
const constants_1 = require("../config/constants");
const auditService_1 = require("../services/auditService");
const notificationService_1 = require("../services/notificationService");
const logger_1 = require("../lib/logger");
exports.verifyDoctor = (0, https_1.onCall)({ region: env_1.REGION, enforceAppCheck: true, timeoutSeconds: 15 }, async (req) => {
    const ctx = (0, requireAuth_1.requireAuth)(req);
    (0, requireRole_1.requireRole)(ctx, "admin");
    const input = validators_1.VerifyDoctorInput.parse(req.data);
    try {
        const ref = firebase_1.db.collection(constants_1.COLLECTIONS.doctorProfiles).doc(input.doctorUid);
        const snap = await ref.get();
        if (!snap.exists)
            throw new https_1.HttpsError("not-found", "Doctor not found");
        await ref.update({
            verificationStatus: input.decision,
            verifiedAt: input.decision === "verified" ? firebase_1.Timestamp.now() : null,
            updatedAt: firebase_1.Timestamp.now(),
        });
        // Mirror into custom claim so security rules can use it cheaply.
        const existing = (await firebase_1.auth.getUser(input.doctorUid)).customClaims ?? {};
        await firebase_1.auth.setCustomUserClaims(input.doctorUid, {
            ...existing,
            role: "doctor",
            verified: input.decision === "verified",
        });
        await (0, auditService_1.recordAudit)({
            action: `doctor.${input.decision}`,
            actorUid: ctx.uid,
            actorRole: "admin",
            targetType: "doctor",
            targetId: input.doctorUid,
            metadata: input.reason ? { reason: input.reason } : {},
        });
        await (0, notificationService_1.notifyUser)(input.doctorUid, {
            title: input.decision === "verified" ? "Verification approved" : "Verification update",
            body: input.decision === "verified"
                ? "You can now accept house call requests."
                : `Your application was not approved. ${input.reason ?? ""}`.trim(),
            category: "system",
            data: { type: `doctor.${input.decision}` },
        });
        return { ok: true, refreshToken: true };
    }
    catch (err) {
        if (err instanceof https_1.HttpsError)
            throw err;
        logger_1.logger.error("verifyDoctor failed", err, { uid: ctx.uid });
        throw new https_1.HttpsError("internal", "Could not verify doctor");
    }
});
//# sourceMappingURL=verifyDoctor.js.map