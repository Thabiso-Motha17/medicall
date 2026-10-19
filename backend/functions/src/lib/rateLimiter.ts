/**
 * Token-bucket rate limiter backed by Firestore. One doc per
 * (uid, bucket) — survives cold starts and works across instances.
 *
 * Trade-off: each call costs 1 read + 1 write. For very hot endpoints,
 * front this with a Memorystore (Redis) instance.
 */
import { db, FieldValue, Timestamp } from "../config/firebase";
import { Errors } from "./errors";

interface BucketState {
  tokens: number;
  capacity: number;
  refillPerSecond: number;
  updatedAt: Timestamp;
}

export interface RateLimitConfig {
  capacity: number;
  refillPerSecond: number;
}

export async function consume(
  uid: string,
  bucket: string,
  cfg: RateLimitConfig,
  cost = 1,
): Promise<void> {
  const ref = db.collection("rateLimits").doc(`${uid}_${bucket}`);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = Timestamp.now();
    const prev = snap.exists ? (snap.data() as BucketState) : null;

    let tokens = cfg.capacity;
    if (prev) {
      const elapsedSec = now.seconds - prev.updatedAt.seconds;
      tokens = Math.min(
        cfg.capacity,
        prev.tokens + elapsedSec * cfg.refillPerSecond,
      );
    }
    if (tokens < cost) {
      const need = cost - tokens;
      const retryAfterSec = Math.ceil(need / cfg.refillPerSecond);
      throw Errors.rateLimited(retryAfterSec);
    }
    tx.set(ref, {
      tokens: tokens - cost,
      capacity: cfg.capacity,
      refillPerSecond: cfg.refillPerSecond,
      updatedAt: now,
    } satisfies BucketState, { merge: true });

    // Self-heal counter for observability
    tx.set(
      db.collection("rateLimits").doc("_metrics"),
      { [`${bucket}_consumed`]: FieldValue.increment(cost) },
      { merge: true },
    );
  });
}
