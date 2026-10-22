type Bucket = {
  timestamps: number[];
};

const buckets = new Map<string, Bucket>();

/**
 * Best-effort in-memory limiter. Serverless instances do not share memory, so
 * this is a first line of defence only; the database also enforces per-user
 * document limits.
 */
export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((timestamp) => now - timestamp < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0] ?? now;
    buckets.set(key, bucket);
    return { ok: false, retryAfterMs: Math.max(0, windowMs - (now - oldest)) };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);

  if (buckets.size > 5_000) {
    for (const [bucketKey, value] of buckets) {
      if (value.timestamps.every((timestamp) => now - timestamp >= windowMs)) {
        buckets.delete(bucketKey);
      }
    }
  }

  return { ok: true };
}
