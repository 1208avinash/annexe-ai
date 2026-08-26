import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class BackupManager {
  constructor({ workspaceRoot = path.resolve(process.cwd(), "workspace", "enterprise-scaling") } = {}) {
    this.workspaceRoot = workspaceRoot;
    this.backupRoot = path.join(workspaceRoot, "backups");
  }

  createBackup({ sourceLabel = "database", payload = {} } = {}) {
    ensureDir(this.backupRoot);
    const filePath = path.join(this.backupRoot, `${sourceLabel}-${Date.now()}.json`);
    writeJson(filePath, {
      sourceLabel,
      generatedAt: new Date().toISOString(),
      payload
    });
    return filePath;
  }
}
