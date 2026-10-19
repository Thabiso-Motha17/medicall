"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consume = consume;
/**
 * Token-bucket rate limiter backed by Firestore. One doc per
 * (uid, bucket) — survives cold starts and works across instances.
 *
 * Trade-off: each call costs 1 read + 1 write. For very hot endpoints,
 * front this with a Memorystore (Redis) instance.
 */
const firebase_1 = require("../config/firebase");
const errors_1 = require("./errors");
async function consume(uid, bucket, cfg, cost = 1) {
    const ref = firebase_1.db.collection("rateLimits").doc(`${uid}_${bucket}`);
    await firebase_1.db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const now = firebase_1.Timestamp.now();
        const prev = snap.exists ? snap.data() : null;
        let tokens = cfg.capacity;
        if (prev) {
            const elapsedSec = now.seconds - prev.updatedAt.seconds;
            tokens = Math.min(cfg.capacity, prev.tokens + elapsedSec * cfg.refillPerSecond);
        }
        if (tokens < cost) {
            const need = cost - tokens;
            const retryAfterSec = Math.ceil(need / cfg.refillPerSecond);
            throw errors_1.Errors.rateLimited(retryAfterSec);
        }
        tx.set(ref, {
            tokens: tokens - cost,
            capacity: cfg.capacity,
            refillPerSecond: cfg.refillPerSecond,
            updatedAt: now,
        }, { merge: true });
        // Self-heal counter for observability
        tx.set(firebase_1.db.collection("rateLimits").doc("_metrics"), { [`${bucket}_consumed`]: firebase_1.FieldValue.increment(cost) }, { merge: true });
    });
}
//# sourceMappingURL=rateLimiter.js.map