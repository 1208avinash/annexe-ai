import path from "path";

import ArtifactStorageAdapter from "./artifact-storage-adapter.js";
import ReportStorageAdapter from "./report-storage-adapter.js";
import BackupStorageAdapter from "./backup-storage-adapter.js";

export default class S3StorageAdapter {
  constructor({
    workspaceRoot = path.resolve(process.cwd(), "workspace", "cloud-infrastructure"),
    bucket = "annexe-ai-cloud"
  } = {}) {
    this.workspaceRoot = workspaceRoot;
    this.bucket = bucket;
    this.artifactStorage = new ArtifactStorageAdapter({ workspaceRoot });
    this.reportStorage = new ReportStorageAdapter({ workspaceRoot });
    this.backupStorage = new BackupStorageAdapter({ workspaceRoot });
  }

  uploadArtifact(name, content) {
    return this.artifactStorage.store(name, content);
  }

  uploadReport(name, value) {
    return this.reportStorage.store(name, value);
  }

  uploadBackup(name, value) {
    return this.backupStorage.store(name, value);
  }

  describe() {
    return {
      provider: "AWS S3",
      bucket: this.bucket,
      artifactRoot: this.artifactStorage.artifactRoot,
      reportRoot: this.reportStorage.reportRoot,
      backupRoot: this.backupStorage.backupRoot,
      status: "READY"
    };
  }
}
