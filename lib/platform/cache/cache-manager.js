export default class CacheManager {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, ttlMs = 0) {
    this.cache.set(key, {
      value,
      expiresAt: ttlMs ? Date.now() + ttlMs : null
    });
    return value;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  stats() {
    return {
      entries: this.cache.size,
      status: "ready"
    };
  }
}
