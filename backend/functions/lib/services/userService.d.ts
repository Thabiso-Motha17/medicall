import type { UserRole } from "../types/user";
/** Bootstrap a brand-new user (called from auth.user().onCreate). */
export declare function bootstrapUser(uid: string, info: {
    email: string | null;
    phone: string | null;
    displayName: string | null;
    photoUrl: string | null;
}): Promise<void>;
/** Admin-only: change a user's role (and refresh claims). */
export declare function setUserRole(opts: {
    actorUid: string;
    targetUid: string;
    role: UserRole;
}): Promise<void>;
/** Increment the user's unread badge atomically. */
export declare function bumpUnread(uid: string, by: number): Promise<void>;
