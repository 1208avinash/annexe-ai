export default class RateLimiter {
  constructor({ limit = 100, windowMs = 60000 } = {}) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.bucket = new Map();
  }

  allow(key) {
    const now = Date.now();
    const entry = this.bucket.get(key) || { count: 0, resetAt: now + this.windowMs };
    if (now > entry.resetAt) {
      entry.count = 0;
      entry.resetAt = now + this.windowMs;
    }
    entry.count += 1;
    this.bucket.set(key, entry);
    return {
      allowed: entry.count <= this.limit,
      count: entry.count,
      resetAt: entry.resetAt
    };
  }
}
