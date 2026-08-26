import path from "path";

import PostgresManager from "../../infrastructure/scaling/database/postgres-manager.js";

export default class DatabaseHealthService {
  constructor({
    workspaceRoot = path.resolve(process.cwd(), "workspace", "cloud-infrastructure"),
    postgresManager = null
  } = {}) {
    this.workspaceRoot = workspaceRoot;
    this.postgresManager = postgresManager || new PostgresManager({ workspaceRoot });
  }

  check() {
    const postgres = this.postgresManager.initialize();
    return {
      status: postgres.status === "ready" ? "READY" : "DEGRADED",
      engine: postgres.engine,
      connectionPool: postgres.connectionPool,
      databaseRoot: postgres.databaseRoot,
      statePath: postgres.statePath,
      checkedAt: new Date().toISOString()
    };
  }
}
