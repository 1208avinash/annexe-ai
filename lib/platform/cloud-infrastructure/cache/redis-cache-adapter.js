import CacheManager from "../../cache/cache-manager.js";

export default class RedisCacheAdapter {
  constructor({ namespace = "annexe-cloud", cacheManager = new CacheManager() } = {}) {
    this.namespace = namespace;
    this.cacheManager = cacheManager;
  }

  set(key, value, ttlMs = 0) {
    return this.cacheManager.set(`${this.namespace}:${key}`, value, ttlMs);
  }

  get(key) {
    return this.cacheManager.get(`${this.namespace}:${key}`);
  }

  snapshot() {
    return {
      namespace: this.namespace,
      ...this.cacheManager.stats(),
      status: "READY"
    };
  }
}
