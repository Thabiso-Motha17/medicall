import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "./firebase";

export async function getVerifiedDoctors() {
  const q = query(
    collection(db, "doctors"),
    where("verificationStatus", "==", "verified"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
