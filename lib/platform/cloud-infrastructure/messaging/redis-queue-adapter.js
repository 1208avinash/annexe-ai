import QueueAdapter from "./queue-adapter.js";

export default class RedisQueueAdapter {
  constructor({ namespace = "annexe-cloud", queueAdapter = new QueueAdapter({ provider: "redis" }) } = {}) {
    this.namespace = namespace;
    this.queueAdapter = queueAdapter;
  }

  enqueue(job) {
    return this.queueAdapter.create({
      ...job,
      namespace: this.namespace
    });
  }

  registerWorker(worker) {
    return {
      ...worker,
      namespace: this.namespace,
      registeredAt: new Date().toISOString(),
      status: "READY"
    };
  }

  communicate(message) {
    return this.queueAdapter.communicate({
      namespace: this.namespace,
      ...message
    });
  }

  status() {
    return {
      namespace: this.namespace,
      ...this.queueAdapter.status()
    };
  }
}
