export default class MetricsService {
  constructor() {
    this.metrics = {};
  }

  record(name, value) {
    this.metrics[name] = value;
    return { name, value };
  }

  snapshot() {
    return { ...this.metrics };
  }
}
