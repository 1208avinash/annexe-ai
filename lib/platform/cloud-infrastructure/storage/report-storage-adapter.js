import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export default class ReportStorageAdapter {
  constructor({ workspaceRoot = path.resolve(process.cwd(), "workspace", "cloud-infrastructure") } = {}) {
    this.workspaceRoot = workspaceRoot;
    this.reportRoot = path.join(workspaceRoot, "reports", "platform", "cloud");
  }

  store(name, value) {
    ensureDir(this.reportRoot);
    const filePath = path.join(this.reportRoot, name);
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
    return filePath;
  }

  describe() {
    return {
      provider: "report-storage",
      reportRoot: this.reportRoot,
      status: "READY"
    };
  }
}
