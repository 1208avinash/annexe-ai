import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export default class ArtifactStorageAdapter {
  constructor({ workspaceRoot = path.resolve(process.cwd(), "workspace", "cloud-infrastructure") } = {}) {
    this.workspaceRoot = workspaceRoot;
    this.artifactRoot = path.join(workspaceRoot, "storage", "artifacts");
  }

  store(name, content) {
    ensureDir(this.artifactRoot);
    const filePath = path.join(this.artifactRoot, name);
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, String(content ?? ""), "utf8");
    return filePath;
  }

  describe() {
    return {
      provider: "artifact-storage",
      artifactRoot: this.artifactRoot,
      status: "READY"
    };
  }
}
