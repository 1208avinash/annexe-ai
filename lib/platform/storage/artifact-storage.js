import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export default class ArtifactStorage {
  constructor({ workspaceRoot = path.resolve(process.cwd(), "workspace", "enterprise-scaling") } = {}) {
    this.artifactRoot = path.join(workspaceRoot, "storage", "artifacts");
  }

  store(name, content) {
    ensureDir(this.artifactRoot);
    const filePath = path.join(this.artifactRoot, name);
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, String(content ?? ""), "utf8");
    return filePath;
  }
}
