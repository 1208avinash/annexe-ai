import path from "path";

import PostgresManager from "../../infrastructure/scaling/database/postgres-manager.js";
import CloudConnectionPoolManager from "./connection-pool-manager.js";
import MigrationAdapter from "./migration-adapter.js";
import BackupAdapter from "./backup-adapter.js";
import DatabaseHealthService from "./database-health-service.js";

export default class PostgresAdapter {
  constructor({
    workspaceRoot = path.resolve(process.cwd(), "workspace", "cloud-infrastructure"),
    maxConnections = 100,
    region = "us-east-1",
    availabilityZone = "us-east-1a",
    dataResidency = "multi-region",
    complianceLocation = "global"
  } = {}) {
    this.workspaceRoot = workspaceRoot;
    this.region = region;
    this.availabilityZone = availabilityZone;
    this.dataResidency = dataResidency;
    this.complianceLocation = complianceLocation;
    this.databaseRoot = path.join(workspaceRoot, "database");
    this.connectionPoolManager = new CloudConnectionPoolManager({ maxConnections });
    this.postgresManager = new PostgresManager({ workspaceRoot });
    this.migrationAdapter = new MigrationAdapter({ dataRoot: this.databaseRoot });
    this.backupAdapter = new BackupAdapter({ workspaceRoot });
    this.healthService = new DatabaseHealthService({ workspaceRoot, postgresManager: this.postgresManager });
  }

  initialize() {
    const postgres = this.postgresManager.initialize();
    const migration = this.migrationAdapter.ensure(this.databaseRoot);
    const connectionPool = this.connectionPoolManager.health();
    return {
      engine: postgres.engine,
      status: "READY",
      connectionPool,
      migration,
      backupSupport: true,
      region: this.region,
      availabilityZone: this.availabilityZone,
      dataResidency: this.dataResidency,
      complianceLocation: this.complianceLocation,
      databaseRoot: postgres.databaseRoot,
      statePath: postgres.statePath
    };
  }

  connect() {
    const connection = this.connectionPoolManager.acquire();
    const snapshot = this.connectionPoolManager.health();
    connection.release();
    return {
      status: "connected",
      connectionPool: snapshot
    };
  }

  migrate() {
    return this.migrationAdapter.ensure(this.databaseRoot);
  }

  backup(payload = {}) {
    return this.backupAdapter.createBackup({
      sourceLabel: "cloud-postgres",
      payload: {
        ...payload,
        region: this.region,
        availabilityZone: this.availabilityZone,
        dataResidency: this.dataResidency
      }
    });
  }

  health() {
    return this.healthService.check();
  }
}
