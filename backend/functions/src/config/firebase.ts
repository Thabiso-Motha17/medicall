/**
 * Admin SDK singleton — initialised exactly once per cold start.
 * Always import `db`, `auth`, `storage` from here, never call
 * `getFirestore()` ad hoc in feature code.
 */
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { getMessaging } from "firebase-admin/messaging";

if (!getApps().length) initializeApp();

export const db        = getFirestore();
export const auth      = getAuth();
export const storage   = getStorage();
export const messaging = getMessaging();

export { FieldValue, Timestamp };

// Sensible defaults: ignore undefined so partial DTOs don't blow up writes.
db.settings({ ignoreUndefinedProperties: true });
