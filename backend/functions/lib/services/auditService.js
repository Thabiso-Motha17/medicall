"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordAudit = recordAudit;
const firebase_1 = require("../config/firebase");
const constants_1 = require("../config/constants");
/** Append-only — never updated, never deleted (TTL handles archival). */
async function recordAudit(entry) {
    await firebase_1.db.collection(constants_1.COLLECTIONS.auditLogs).add({
        ...entry,
        createdAt: firebase_1.Timestamp.now(),
        _server: firebase_1.FieldValue.serverTimestamp(),
    });
}
//# sourceMappingURL=auditService.js.map