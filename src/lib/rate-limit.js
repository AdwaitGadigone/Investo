import "server-only";

// In-memory, per-serverless-instance sliding window. Not a distributed limiter (would need something like
// Upstash Redis for that, real infra this project doesn't have set up), but Vercel keeps a small number of
// warm instances for a site at this traffic level, so this still meaningfully throttles a single bad actor
// instead of doing nothing at all. Same pragmatic tradeoff as the in-memory caches elsewhere in this codebase.
const buckets = new Map();

// Prunes on every call instead of a separate interval, keeps the map from growing unbounded over a long
// server lifetime without needing a background timer.
function prune(now) {
  for (const [key, hits] of buckets) {
    const fresh = hits.filter((t) => now - t < 5 * 60 * 1000);
    if (fresh.length === 0) buckets.delete(key);
    else buckets.set(key, fresh);
  }
}

// Returns true if this key is currently over its limit. Call this before doing the real work, not after.
export function isRateLimited(key, limit, windowMs) {
  const now = Date.now();
  if (Math.random() < 0.01) prune(now);

  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return true;
  }

  hits.push(now);
  buckets.set(key, hits);
  return false;
}

// Vercel sets x-forwarded-for to the real client IP, request.ip isn't populated on this runtime.
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}
