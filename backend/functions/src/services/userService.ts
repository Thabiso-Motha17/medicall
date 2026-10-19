import { auth, db, FieldValue, Timestamp } from "../config/firebase";
import { COLLECTIONS } from "../config/constants";
import type { User, UserRole } from "../types/user";
import { recordAudit } from "./auditService";

/** Bootstrap a brand-new user (called from auth.user().onCreate). */
export async function bootstrapUser(uid: string, info: {
  email: string | null;
  phone: string | null;
  displayName: string | null;
  photoUrl: string | null;
}): Promise<void> {
  const now = Timestamp.now();
  const user: User = {
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
  await db.collection(COLLECTIONS.users).doc(uid).set(user);
  await auth.setCustomUserClaims(uid, { role: "patient" });
}

/** Admin-only: change a user's role (and refresh claims). */
export async function setUserRole(opts: {
  actorUid: string;
  targetUid: string;
  role: UserRole;
}): Promise<void> {
  const userRef = db.collection(COLLECTIONS.users).doc(opts.targetUid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) throw new Error("User not found");

  const existing = (await auth.getUser(opts.targetUid)).customClaims ?? {};
  await auth.setCustomUserClaims(opts.targetUid, { ...existing, role: opts.role });
  await userRef.update({ role: opts.role, updatedAt: Timestamp.now() });

  await recordAudit({
    action: "user.role_changed",
    actorUid: opts.actorUid,
    actorRole: "admin",
    targetType: "user",
    targetId: opts.targetUid,
    metadata: { newRole: opts.role },
  });
}

/** Increment the user's unread badge atomically. */
export async function bumpUnread(uid: string, by: number): Promise<void> {
  await db.collection(COLLECTIONS.users).doc(uid).update({
    unreadNotifications: FieldValue.increment(by),
    updatedAt: Timestamp.now(),
  });
}
