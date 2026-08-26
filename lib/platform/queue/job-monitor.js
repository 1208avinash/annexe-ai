export default class JobMonitor {
  constructor({ scheduler, workerManager } = {}) {
    this.scheduler = scheduler;
    this.workerManager = workerManager;
  }

  snapshot() {
    return {
      queueStatus: "healthy",
      workerStatus: this.workerManager?.health?.() || { status: "idle", workers: 0 },
      checkedAt: new Date().toISOString()
    };
  }
}
