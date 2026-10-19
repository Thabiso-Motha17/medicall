import { consume, type RateLimitConfig } from "../lib/rateLimiter";

export async function withRateLimit(
  uid: string,
  bucket: string,
  cfg: RateLimitConfig,
): Promise<void> {
  await consume(uid, bucket, cfg);
}
