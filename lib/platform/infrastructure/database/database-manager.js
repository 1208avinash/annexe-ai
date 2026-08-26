import fs from "fs";
import path from "path";

import SchemaManager from "./schema-manager.js";
import MigrationManager from "./migration-manager.js";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export default class DatabaseManager {
  constructor({
    dataRoot = path.resolve(process.cwd(), "workspace", "production-platform", "data"),
    schemaManager = new SchemaManager(),
    migrationManager = null
  } = {}) {
    this.dataRoot = dataRoot;
    this.schemaManager = schemaManager;
    this.migrationManager = migrationManager || new MigrationManager({ schemaManager });
    this.databasePath = path.join(this.dataRoot, "database.json");
    this.state = null;
    this.schema = null;
  }

  ensureInitialized() {
    ensureDir(this.dataRoot);
    const migrationInfo = this.migrationManager.ensureMigrations({ dataRoot: this.dataRoot });
    this.schema = migrationInfo.schema;

    if (!fs.existsSync(this.databasePath)) {
      this.state = this.schemaManager.createSeedState();
      writeJson(this.databasePath, this.state);
      return this.state;
    }

    this.state = readJson(this.databasePath, this.schemaManager.createSeedState());
    this.state.collections = this.state.collections || {};

    for (const collectionName of Object.keys(this.schema.collections)) {
      if (!Array.isArray(this.state.collections[collectionName])) {
        this.state.collections[collectionName] = [];
      }
    }

    return this.state;
  }

  readState() {
    if (!this.state) {
      this.ensureInitialized();
    }

    return clone(this.state);
  }

  writeState(nextState) {
    this.state = clone(nextState);
    writeJson(this.databasePath, this.state);
    return this.readState();
  }

  collection(name) {
    const state = this.ensureInitialized();
    if (!state.collections[name]) {
      state.collections[name] = [];
    }
    return state.collections[name];
  }

  list(collectionName) {
    return clone(this.collection(collectionName));
  }

  findById(collectionName, id) {
    return this.collection(collectionName).find(item => item.id === id) || null;
  }

  findOne(collectionName, predicate) {
    return this.collection(collectionName).find(predicate) || null;
  }

  insert(collectionName, record) {
    const state = this.ensureInitialized();
    const now = new Date().toISOString();
    const entity = {
      id: record.id || createId(collectionName.slice(0, 3).toUpperCase()),
      createdAt: record.createdAt || now,
      updatedAt: record.updatedAt || now,
      ...record
    };

    state.collections[collectionName].push(entity);
    this.writeState(state);
    return clone(entity);
  }

  update(collectionName, id, patch) {
    const state = this.ensureInitialized();
    const items = state.collections[collectionName] || [];
    const index = items.findIndex(item => item.id === id);

    if (index < 0) {
      return null;
    }

    const next = {
      ...items[index],
      ...patch,
      updatedAt: new Date().toISOString()
    };
    items[index] = next;
    this.writeState(state);
    return clone(next);
  }

  remove(collectionName, id) {
    const state = this.ensureInitialized();
    const items = state.collections[collectionName] || [];
    const index = items.findIndex(item => item.id === id);

    if (index < 0) {
      return false;
    }

    items.splice(index, 1);
    this.writeState(state);
    return true;
  }

  append(collectionName, record) {
    return this.insert(collectionName, record);
  }
}
