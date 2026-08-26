import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export default class ReportStorage {
  constructor({ workspaceRoot = path.resolve(process.cwd(), "workspace", "enterprise-scaling") } = {}) {
    this.reportRoot = path.join(workspaceRoot, "reports", "platform");
  }

  store(name, value) {
    ensureDir(this.reportRoot);
    const filePath = path.join(this.reportRoot, name);
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
    return filePath;
  }
}
