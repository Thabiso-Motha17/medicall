export interface AuditEntry {
    action: string;
    actorUid: string;
    actorRole: "patient" | "doctor" | "admin" | "system";
    targetType: string;
    targetId: string;
    metadata?: Record<string, unknown>;
}
/** Append-only — never updated, never deleted (TTL handles archival). */
export declare function recordAudit(entry: AuditEntry): Promise<void>;
