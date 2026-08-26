import RedisCacheAdapter from "./redis-cache-adapter.js";

export default class ApplicationCacheService {
  constructor({ redisCacheAdapter = new RedisCacheAdapter({ namespace: "application" }) } = {}) {
    this.redisCacheAdapter = redisCacheAdapter;
  }

  setApplication(key, value, ttlMs = 0) {
    return this.redisCacheAdapter.set(key, {
      type: "application",
      ...value
    }, ttlMs);
  }

  getApplication(key) {
    return this.redisCacheAdapter.get(key);
  }

  snapshot() {
    return {
      type: "application",
      ...this.redisCacheAdapter.snapshot()
    };
  }
}
