"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onDoctorDocumentUpload = void 0;
const storage_1 = require("firebase-functions/v2/storage");
const env_1 = require("../config/env");
const firebase_1 = require("../config/firebase");
const constants_1 = require("../config/constants");
const logger_1 = require("../lib/logger");
/**
 * When a doctor uploads a verification document, register it in their
 * documents subcollection so admins can review. The actual file stays in
 * Storage; we only persist metadata here.
 */
exports.onDoctorDocumentUpload = (0, storage_1.onObjectFinalized)({ region: env_1.REGION, memory: "256MiB" }, async (event) => {
    const path = event.data.name; // e.g. doctors/{uid}/documents/license.pdf
    if (!path)
        return;
    const m = path.match(/^doctors\/([^/]+)\/documents\/(.+)$/);
    if (!m)
        return;
    const [, doctorUid, fileName] = m;
    if (!doctorUid || !fileName)
        return;
    try {
        await firebase_1.db.collection(constants_1.COLLECTIONS.doctorProfiles).doc(doctorUid)
            .collection(constants_1.SUBCOLLECTIONS.documents)
            .doc(encodeURIComponent(fileName))
            .set({
            fileName,
            storagePath: path,
            contentType: event.data.contentType ?? null,
            size: Number(event.data.size ?? 0),
            uploadedAt: firebase_1.Timestamp.now(),
            status: "pending_review",
        }, { merge: true });
    }
    catch (err) {
        logger_1.logger.error("onDoctorDocumentUpload failed", err, { fn: "onDoctorDocumentUpload", doctorUid });
    }
});
//# sourceMappingURL=onDoctorDocumentUpload.js.map