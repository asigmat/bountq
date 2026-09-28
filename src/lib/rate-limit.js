const buckets = new Map();
let callsSinceCleanup = 0;

function getClientKey(request) {
    // Configure the reverse proxy to overwrite these headers before relying on them.
    return request.headers.get('x-real-ip')
        || request.headers.get('cf-connecting-ip')
        || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || 'unknown';
}

export function rateLimit(request, scope, limit = 8, windowMs = 60_000) {
    const now = Date.now();
    const key = `${scope}:${getClientKey(request)}`;
    let bucket = buckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
        bucket = { count: 0, resetAt: now + windowMs };
    }
    bucket.count += 1;
    buckets.set(key, bucket);

    callsSinceCleanup += 1;
    if (callsSinceCleanup >= 500 || buckets.size > 10_000) {
        for (const [entry, value] of buckets) {
            if (now >= value.resetAt) buckets.delete(entry);
        }
        callsSinceCleanup = 0;
    }

    return bucket.count > limit
        ? { limited: true, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) }
        : { limited: false, retryAfter: 0 };
}
