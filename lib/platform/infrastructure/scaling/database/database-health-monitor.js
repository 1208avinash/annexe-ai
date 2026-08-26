export default class DatabaseHealthMonitor {
  constructor({ postgresManager } = {}) {
    this.postgresManager = postgresManager;
  }

  check() {
    const postgres = this.postgresManager.initialize();
    return {
      status: "healthy",
      engine: postgres.engine,
      connectionPool: postgres.connectionPool,
      checkedAt: new Date().toISOString()
    };
  }
}
