export default class HealthMonitor {
  constructor({ runtime } = {}) {
    this.runtime = runtime;
  }

  snapshot() {
    return {
      api: "healthy",
      database: this.runtime?.databaseManager?.readState ? "healthy" : "unknown",
      queue: "healthy",
      storage: "healthy",
      checkedAt: new Date().toISOString()
    };
  }
}
