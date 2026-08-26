import ArtifactStorage from "./artifact-storage.js";
import ReportStorage from "./report-storage.js";
import BackupStorage from "./backup-storage.js";

export default class StorageService {
  constructor({ workspaceRoot } = {}) {
    this.artifactStorage = new ArtifactStorage({ workspaceRoot });
    this.reportStorage = new ReportStorage({ workspaceRoot });
    this.backupStorage = new BackupStorage({ workspaceRoot });
  }

  storeArtifact(name, content) {
    return this.artifactStorage.store(name, content);
  }

  storeReport(name, value) {
    return this.reportStorage.store(name, value);
  }

  storeBackup(name, value) {
    return this.backupStorage.store(name, value);
  }
}
