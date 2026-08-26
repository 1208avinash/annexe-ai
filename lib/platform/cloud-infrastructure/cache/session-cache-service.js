import RedisCacheAdapter from "./redis-cache-adapter.js";

export default class SessionCacheService {
  constructor({ redisCacheAdapter = new RedisCacheAdapter({ namespace: "session" }) } = {}) {
    this.redisCacheAdapter = redisCacheAdapter;
  }

  setSession(sessionId, value, ttlMs = 0) {
    return this.redisCacheAdapter.set(sessionId, {
      type: "session",
      ...value
    }, ttlMs);
  }

  getSession(sessionId) {
    return this.redisCacheAdapter.get(sessionId);
  }

  snapshot() {
    return {
      type: "session",
      ...this.redisCacheAdapter.snapshot()
    };
  }
}
