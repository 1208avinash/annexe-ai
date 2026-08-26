export default class SessionCache {
  constructor({ cacheManager } = {}) {
    this.cacheManager = cacheManager;
  }

  setSession(sessionId, value) {
    return this.cacheManager.set(`session:${sessionId}`, value, 1000 * 60 * 60 * 8);
  }

  getSession(sessionId) {
    return this.cacheManager.get(`session:${sessionId}`);
  }
}
