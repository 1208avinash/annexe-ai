import fs from "fs";
import path from "path";

import BackupManager from "../../infrastructure/scaling/database/backup-manager.js";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export default class BackupAdapter {
  constructor({ workspaceRoot = path.resolve(process.cwd(), "workspace", "cloud-infrastructure") } = {}) {
    this.workspaceRoot = workspaceRoot;
    this.backupManager = new BackupManager({ workspaceRoot });
    this.backupRoot = path.join(workspaceRoot, "backups");
  }

  createBackup({ sourceLabel = "cloud-database", payload = {} } = {}) {
    ensureDir(this.backupRoot);
    const backupPath = this.backupManager.createBackup({ sourceLabel, payload });
    return {
      sourceLabel,
      backupPath,
      status: "READY"
    };
  }

  describe() {
    return {
      backupRoot: this.backupRoot,
      status: "READY"
    };
  }
}
