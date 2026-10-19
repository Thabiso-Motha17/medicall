/**
 * Seed the local emulator with demo patients, doctors, and an appointment.
 * Run AFTER `firebase emulators:start`.
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 \
 *   FIREBASE_AUTH_EMULATOR_HOST=localhost:9099 \
 *   ts-node scripts/seed.ts
 */
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, GeoPoint, Timestamp } from "firebase-admin/firestore";

initializeApp({ projectId: "medicall-dev" });
const db = getFirestore();
const auth = getAuth();

async function ensureUser(email: string, password: string, role: "patient" | "doctor" | "admin") {
  let user;
  try { user = await auth.getUserByEmail(email); }
  catch { user = await auth.createUser({ email, password, displayName: email.split("@")[0] }); }
  await auth.setCustomUserClaims(user.uid, { role, verified: role === "doctor" ? true : undefined });
  await db.collection("users").doc(user.uid).set({
    uid: user.uid, role, email, phone: null,
    displayName: user.displayName ?? email,
    photoUrl: null, locale: "en-US",
    disabled: false, unreadNotifications: 0,
    createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  }, { merge: true });
  return user.uid;
}

async function main() {
  const patientUid = await ensureUser("demo@medicall.app", "demo1234", "patient");
  const doctorUid  = await ensureUser("doctor@medicall.app", "doctor1234", "doctor");

  await db.collection("doctorProfiles").doc(doctorUid).set({
    uid: doctorUid,
    specialties: ["general", "pediatric"],
    licenseNumber: "MD-123456",
    verificationStatus: "verified",
    verifiedAt: Timestamp.now(),
    experienceYears: 12,
    consultationFeeCents: 8900,
    currency: "USD",
    bio: "Family medicine, geriatric care.",
    languages: ["English", "Spanish"],
    ratingAvg: 4.9, ratingCount: 1284,
    isOnline: true, isAcceptingRequests: true,
    lastLocation: new GeoPoint(37.7749, -122.4194),
    geohash: "9q8yyk8yt",
    lastSeenAt: Timestamp.now(),
    createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  }, { merge: true });

  await db.collection("patientProfiles").doc(patientUid).set({
    uid: patientUid,
    emergencyContacts: [],
    medicalNotes: "",
    createdAt: Timestamp.now(), updatedAt: Timestamp.now(),
  }, { merge: true });

  console.log("seeded", { patientUid, doctorUid });
}
main().catch((e) => { console.error(e); process.exit(1); });
