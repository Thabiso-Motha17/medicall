"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapUser = bootstrapUser;
exports.setUserRole = setUserRole;
exports.bumpUnread = bumpUnread;
const firebase_1 = require("../config/firebase");
const constants_1 = require("../config/constants");
const auditService_1 = require("./auditService");
/** Bootstrap a brand-new user (called from auth.user().onCreate). */
async function bootstrapUser(uid, info) {
    const now = firebase_1.Timestamp.now();
    const user = {
        uid,
        role: "patient",
        email: info.email,
        phone: info.phone,
        displayName: info.displayName ?? "New user",
        photoUrl: info.photoUrl,
        locale: "en-US",
        disabled: false,
        unreadNotifications: 0,
        createdAt: now,
        updatedAt: now,
    };
    await firebase_1.db.collection(constants_1.COLLECTIONS.users).doc(uid).set(user);
    await firebase_1.auth.setCustomUserClaims(uid, { role: "patient" });
}
/** Admin-only: change a user's role (and refresh claims). */
async function setUserRole(opts) {
    const userRef = firebase_1.db.collection(constants_1.COLLECTIONS.users).doc(opts.targetUid);
    const userSnap = await userRef.get();
    if (!userSnap.exists)
        throw new Error("User not found");
    const existing = (await firebase_1.auth.getUser(opts.targetUid)).customClaims ?? {};
    await firebase_1.auth.setCustomUserClaims(opts.targetUid, { ...existing, role: opts.role });
    await userRef.update({ role: opts.role, updatedAt: firebase_1.Timestamp.now() });
    await (0, auditService_1.recordAudit)({
        action: "user.role_changed",
        actorUid: opts.actorUid,
        actorRole: "admin",
        targetType: "user",
        targetId: opts.targetUid,
        metadata: { newRole: opts.role },
    });
}
/** Increment the user's unread badge atomically. */
async function bumpUnread(uid, by) {
    await firebase_1.db.collection(constants_1.COLLECTIONS.users).doc(uid).update({
        unreadNotifications: firebase_1.FieldValue.increment(by),
        updatedAt: firebase_1.Timestamp.now(),
    });
}
//# sourceMappingURL=userService.js.map