import CoreConnectionPoolManager from "../../infrastructure/scaling/database/connection-pool-manager.js";

export default class CloudConnectionPoolManager {
  constructor({ maxConnections = 100 } = {}) {
    this.pool = new CoreConnectionPoolManager({ maxConnections });
  }

  acquire() {
    return this.pool.acquire();
  }

  configure({ maxConnections } = {}) {
    if (typeof maxConnections === "number") {
      this.pool.maxConnections = maxConnections;
    }

    return this.health();
  }

  health() {
    return {
      provider: "cloud",
      ...this.pool.health()
    };
  }
}
