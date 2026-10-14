/**
 * Simple in-memory rate limit for /api/mimir/chat.
 * Per-IP sliding window — enough for prototype containment (not multi-instance durable).
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkMimirRateLimit(ip: string): {
  ok: boolean;
  retryAfterSec?: number;
} {
  const now = Date.now();
  const key = ip || "unknown";
  let bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(key, bucket);
  }

  if (bucket.count >= MAX_PER_WINDOW) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true };
}
