import QueueManager from "../../queue/queue-manager.js";

export default class QueueAdapter {
  constructor({ queueManager = new QueueManager(), provider = "cloud" } = {}) {
    this.queueManager = queueManager;
    this.provider = provider;
  }

  create(job) {
    return this.queueManager.enqueue({
      ...job,
      provider: job?.provider ?? this.provider
    });
  }

  process(job) {
    return {
      ...job,
      processedAt: new Date().toISOString(),
      status: "processed"
    };
  }

  communicate(message) {
    return {
      provider: this.provider,
      delivered: true,
      message,
      communicatedAt: new Date().toISOString()
    };
  }

  status() {
    return this.queueManager.status();
  }
}
