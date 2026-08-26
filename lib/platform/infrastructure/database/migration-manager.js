import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class MigrationManager {
  constructor({ schemaManager } = {}) {
    this.schemaManager = schemaManager;
  }

  ensureMigrations({ dataRoot }) {
    const schema = this.schemaManager.createSchema();
    const migrationRoot = path.join(dataRoot, "migrations");
    const schemaPath = path.join(migrationRoot, "schema.json");
    const logPath = path.join(migrationRoot, "migrations.json");

    ensureDir(migrationRoot);

    if (!fs.existsSync(schemaPath)) {
      writeJson(schemaPath, schema);
    }

    const migrations = fs.existsSync(logPath)
      ? JSON.parse(fs.readFileSync(logPath, "utf8"))
      : [];

    if (!migrations.length) {
      migrations.push({
        migrationId: `migration-${Date.now()}`,
        version: schema.version,
        appliedAt: new Date().toISOString(),
        collections: Object.keys(schema.collections)
      });
      writeJson(logPath, migrations);
    }

    return {
      schemaPath,
      logPath,
      schema,
      migrations
    };
  }
}
