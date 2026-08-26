import JobScheduler from "./job-scheduler.js";
import WorkerManager from "./worker-manager.js";
import JobMonitor from "./job-monitor.js";

export default class QueueManager {
  constructor() {
    this.scheduler = new JobScheduler();
    this.workerManager = new WorkerManager();
    this.jobMonitor = new JobMonitor({ scheduler: this.scheduler, workerManager: this.workerManager });
  }

  enqueue(job) {
    return this.scheduler.schedule(job);
  }

  registerWorker(worker) {
    return this.workerManager.register(worker);
  }

  status() {
    return this.jobMonitor.snapshot();
  }
}
