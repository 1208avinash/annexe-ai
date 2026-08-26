import MetricsService from "../../monitoring/metrics-service.js";

export default class MetricsAdapter {
  constructor({ metricsService = new MetricsService() } = {}) {
    this.metricsService = metricsService;
  }

  record(name, value) {
    return this.metricsService.record(name, value);
  }

  snapshot() {
    return {
      ...this.metricsService.snapshot(),
      status: "READY"
    };
  }
}
