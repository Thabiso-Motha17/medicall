import { onObjectFinalized } from "firebase-functions/v2/storage";
import { REGION } from "../config/env";
import { db, Timestamp } from "../config/firebase";
import { COLLECTIONS, SUBCOLLECTIONS } from "../config/constants";
import { logger } from "../lib/logger";

/**
 * When a doctor uploads a verification document, register it in their
 * documents subcollection so admins can review. The actual file stays in
 * Storage; we only persist metadata here.
 */
export const onDoctorDocumentUpload = onObjectFinalized(
  { region: REGION, memory: "256MiB" },
  async (event) => {
    const path = event.data.name;             // e.g. doctors/{uid}/documents/license.pdf
    if (!path) return;
    const m = path.match(/^doctors\/([^/]+)\/documents\/(.+)$/);
    if (!m) return;
    const [, doctorUid, fileName] = m;
    if (!doctorUid || !fileName) return;

    try {
      await db.collection(COLLECTIONS.doctorProfiles).doc(doctorUid)
        .collection(SUBCOLLECTIONS.documents)
        .doc(encodeURIComponent(fileName))
        .set({
          fileName,
          storagePath: path,
          contentType: event.data.contentType ?? null,
          size: Number(event.data.size ?? 0),
          uploadedAt: Timestamp.now(),
          status: "pending_review",
        }, { merge: true });
    } catch (err) {
      logger.error("onDoctorDocumentUpload failed", err, { fn: "onDoctorDocumentUpload", doctorUid });
    }
  },
);
