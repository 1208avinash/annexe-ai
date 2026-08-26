export default class SystemDashboard {
  constructor({ healthMonitor, metricsService, alertService } = {}) {
    this.healthMonitor = healthMonitor;
    this.metricsService = metricsService;
    this.alertService = alertService;
  }

  build() {
    return {
      health: this.healthMonitor?.snapshot?.() || {},
      metrics: this.metricsService?.snapshot?.() || {},
      alerts: this.alertService?.alerts || []
    };
  }
}
