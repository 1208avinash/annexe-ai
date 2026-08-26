import MigrationManager from "../../infrastructure/database/migration-manager.js";
import SchemaManager from "../../infrastructure/database/schema-manager.js";

export default class MigrationAdapter {
  constructor({
    schemaManager = new SchemaManager(),
    migrationManager = null,
    dataRoot = null
  } = {}) {
    this.schemaManager = schemaManager;
    this.migrationManager = migrationManager || new MigrationManager({ schemaManager: this.schemaManager });
    this.dataRoot = dataRoot;
  }

  ensure(dataRoot = this.dataRoot) {
    if (!dataRoot) {
      return {
        status: "READY",
        schema: this.schemaManager.createSchema(),
        migrations: []
      };
    }

    const result = this.migrationManager.ensureMigrations({ dataRoot });
    return {
      status: "READY",
      ...result
    };
  }

  snapshot(dataRoot = this.dataRoot) {
    return this.ensure(dataRoot);
  }
}
