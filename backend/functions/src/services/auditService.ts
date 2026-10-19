import { db, FieldValue, Timestamp } from "../config/firebase";
import { COLLECTIONS } from "../config/constants";

export interface AuditEntry {
  action: string;                                         // e.g. "doctor.verified"
  actorUid: string;
  actorRole: "patient" | "doctor" | "admin" | "system";
  targetType: string;                                     // "doctor" | "appointment" | ...
  targetId: string;
  metadata?: Record<string, unknown>;
}

/** Append-only — never updated, never deleted (TTL handles archival). */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  await db.collection(COLLECTIONS.auditLogs).add({
    ...entry,
    createdAt: Timestamp.now(),
    _server: FieldValue.serverTimestamp(),
  });
}
