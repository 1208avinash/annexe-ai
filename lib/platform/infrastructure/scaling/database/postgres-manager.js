import fs from "fs";
import path from "path";

import ConnectionPoolManager from "./connection-pool-manager.js";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class PostgresManager {
  constructor({
    workspaceRoot = path.resolve(process.cwd(), "workspace", "enterprise-scaling"),
    poolManager = new ConnectionPoolManager()
  } = {}) {
    this.workspaceRoot = workspaceRoot;
    this.poolManager = poolManager;
    this.databaseRoot = path.join(workspaceRoot, "database");
  }

  initialize() {
    ensureDir(this.databaseRoot);
    const statePath = path.join(this.databaseRoot, "postgres-state.json");
    if (!fs.existsSync(statePath)) {
      writeJson(statePath, {
        engine: "PostgreSQL",
        status: "ready",
        initializedAt: new Date().toISOString()
      });
    }
    return {
      engine: "PostgreSQL",
      status: "ready",
      connectionPool: this.poolManager.health(),
      databaseRoot: this.databaseRoot,
      statePath
    };
  }
}
