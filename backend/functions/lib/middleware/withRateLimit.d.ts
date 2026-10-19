import { type RateLimitConfig } from "../lib/rateLimiter";
export declare function withRateLimit(uid: string, bucket: string, cfg: RateLimitConfig): Promise<void>;
