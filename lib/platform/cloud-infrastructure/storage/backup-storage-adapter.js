import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export default class BackupStorageAdapter {
  constructor({ workspaceRoot = path.resolve(process.cwd(), "workspace", "cloud-infrastructure") } = {}) {
    this.workspaceRoot = workspaceRoot;
    this.backupRoot = path.join(workspaceRoot, "storage", "backups");
  }

  store(name, value) {
    ensureDir(this.backupRoot);
    const filePath = path.join(this.backupRoot, name);
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
    return filePath;
  }

  describe() {
    return {
      provider: "backup-storage",
      backupRoot: this.backupRoot,
      status: "READY"
    };
  }
}
