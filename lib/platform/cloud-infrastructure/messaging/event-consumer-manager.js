export default class EventConsumerManager {
  constructor({ consumers = [] } = {}) {
    this.consumers = [...consumers];
  }

  register(consumer) {
    this.consumers.push(consumer);
    return {
      count: this.consumers.length,
      status: "READY"
    };
  }

  consumeAll() {
    return this.consumers.map(consumer => ({
      consumed: consumer?.consume?.() ?? null
    }));
  }

  snapshot() {
    return {
      consumerCount: this.consumers.length,
      status: "READY"
    };
  }
}
