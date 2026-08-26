export default class WorkerManager {
  constructor() {
    this.workers = [];
  }

  register(worker) {
    this.workers.push(worker);
    return worker;
  }

  health() {
    return {
      workers: this.workers.length,
      status: this.workers.length > 0 ? "ready" : "idle"
    };
  }
}
