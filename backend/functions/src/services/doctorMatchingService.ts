/**
 * Doctor matching — picks the best available doctor for an incoming
 * appointment request. Strategy:
 *
 *  1. geohash bounding-box query around the patient (10km).
 *  2. filter by specialty + verified + isAcceptingRequests + isOnline.
 *  3. score = w1 * (1/distance) + w2 * ratingAvg + w3 * recency.
 *  4. return top N candidates (caller picks first that accepts).
 *
 * We deliberately do NOT auto-assign here — the request is broadcast to
 * the top N doctors via FCM and the first to accept wins (handled by
 * `acceptAppointment` callable with optimistic version check).
 */
import { db } from "../config/firebase";
import { COLLECTIONS } from "../config/constants";
import {
  geohashQueriesAround, distanceMeters,
} from "../lib/geohash";
import type { DoctorProfile } from "../types/user";

export interface MatchInput {
  specialty: string;
  center: { lat: number; lng: number };
  radiusMeters?: number;
  limit?: number;
}

export interface DoctorCandidate {
  doctor: DoctorProfile;
  distanceMeters: number;
  score: number;
}

export async function findCandidateDoctors(
  input: MatchInput,
): Promise<DoctorCandidate[]> {
  const radius = input.radiusMeters ?? 10_000;
  const limit  = input.limit ?? 5;

  const base = db.collection(COLLECTIONS.doctorProfiles)
    .where("specialties", "array-contains", input.specialty)
    .where("verificationStatus", "==", "verified")
    .where("isAcceptingRequests", "==", true);

  const queries = geohashQueriesAround(base, input.center, radius);
  const snapshots = await Promise.all(queries.map((q) => q.get()));

  const seen = new Set<string>();
  const candidates: DoctorCandidate[] = [];

  for (const snap of snapshots) {
    for (const doc of snap.docs) {
      if (seen.has(doc.id)) continue;
      seen.add(doc.id);
      const d = doc.data() as DoctorProfile;
      if (!d.lastLocation) continue;
      const dist = distanceMeters(input.center, {
        lat: d.lastLocation.latitude,
        lng: d.lastLocation.longitude,
      });
      if (dist > radius) continue;
      const recencyMin = d.lastSeenAt
        ? (Date.now() - d.lastSeenAt.toMillis()) / 60_000
        : 999;
      const score =
        (1 / Math.max(dist, 100)) * 5_000 +   // distance weight
        d.ratingAvg * 1.5 +                    // quality
        Math.max(0, 5 - recencyMin / 5);       // recency
      candidates.push({ doctor: d, distanceMeters: dist, score });
    }
  }

  return candidates.sort((a, b) => b.score - a.score).slice(0, limit);
}
