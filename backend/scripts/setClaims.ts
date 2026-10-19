/**
 * One-off script — promote a user to admin.
 *   ts-node scripts/setClaims.ts <uid> admin
 */
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

initializeApp({ credential: applicationDefault() });

async function main() {
  const [uid, role] = process.argv.slice(2);
  if (!uid || !role) {
    console.error("usage: setClaims.ts <uid> <role>");
    process.exit(1);
  }
  const existing = (await getAuth().getUser(uid)).customClaims ?? {};
  await getAuth().setCustomUserClaims(uid, { ...existing, role });
  console.log(`set role=${role} on ${uid}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
