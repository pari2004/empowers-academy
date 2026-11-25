// Single-instance in-memory sliding-window rate limiter. Same documented
// simplification class as the DB-backed login limiter (lib/services/userService
// / LoginAttempt) — fine for a single-instance deploy, not a distributed one.
// Used only on unauthenticated-adjacent, higher-cost routes (cron endpoints,
// bulk email send) where the DB-backed pattern would be overkill.

import { ApiError } from "@/lib/api-guard";

type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();

/** Returns true if `key` is still within `limit` calls per `windowMs`, incrementing its counter as a side effect. */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function assertRateLimit(key: string, limit: number, windowMs: number): void {
  if (!checkRateLimit(key, limit, windowMs)) {
    throw new ApiError("Too many requests", 429);
  }
}
