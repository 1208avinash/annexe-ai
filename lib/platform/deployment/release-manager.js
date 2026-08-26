export default class ReleaseManager {
  constructor() {
    this.currentVersion = "1.0.0";
  }

  release(version) {
    this.currentVersion = version;
    return {
      version,
      releasedAt: new Date().toISOString()
    };
  }

  rollback(version) {
    this.currentVersion = version;
    return {
      version,
      rolledBackAt: new Date().toISOString()
    };
  }
}
