export interface RateLimitConfig {
    capacity: number;
    refillPerSecond: number;
}
export declare function consume(uid: string, bucket: string, cfg: RateLimitConfig, cost?: number): Promise<void>;
