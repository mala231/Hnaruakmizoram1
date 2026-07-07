interface RateLimitRecord {
  timestamps: number[];
}

const globalForRateLimit = globalThis as unknown as {
  contactRateLimit: Map<string, RateLimitRecord>;
};

if (!globalForRateLimit.contactRateLimit) {
  globalForRateLimit.contactRateLimit = new Map();
}

const limitStore = globalForRateLimit.contactRateLimit;

/**
 * Basic in-memory rate limiter to prevent spam submission floods.
 * Allows up to `max` requests per `windowMs`.
 * Returns true if request is rate limited, false if allowed.
 */
export function isRateLimited(
  ip: string,
  max: number = 3,
  windowMs: number = 60 * 60 * 1000 // 1 hour default
): boolean {
  const now = Date.now();
  const record = limitStore.get(ip);

  if (!record) {
    limitStore.set(ip, { timestamps: [now] });
    return false;
  }

  // Filter out timestamps that fall outside the current sliding window
  const cutoff = now - windowMs;
  record.timestamps = record.timestamps.filter((time) => time > cutoff);

  if (record.timestamps.length >= max) {
    return true; // Exceeded limit
  }

  record.timestamps.push(now);
  limitStore.set(ip, record);
  return false;
}
