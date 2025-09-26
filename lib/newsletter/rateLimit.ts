const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const rateLimitBuckets = new Map<string, RateLimitBucket>();

export function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const existing = rateLimitBuckets.get(identifier);

  if (!existing) {
    rateLimitBuckets.set(identifier, { tokens: RATE_LIMIT_MAX_REQUESTS - 1, lastRefill: now });
    return false;
  }

  const elapsed = now - existing.lastRefill;
  if (elapsed > RATE_LIMIT_WINDOW_MS) {
    existing.tokens = RATE_LIMIT_MAX_REQUESTS - 1;
    existing.lastRefill = now;
    return false;
  }

  if (existing.tokens <= 0) {
    return true;
  }

  existing.tokens -= 1;
  return false;
}

export function clearNewsletterRateLimit(): void {
  rateLimitBuckets.clear();
}
