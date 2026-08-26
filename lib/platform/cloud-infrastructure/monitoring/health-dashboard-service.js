import HealthMonitor from "../../monitoring/health-monitor.js";
import MetricsService from "../../monitoring/metrics-service.js";
import AlertService from "../../monitoring/alert-service.js";
import SystemDashboard from "../../monitoring/system-dashboard.js";

export default class HealthDashboardService {
  constructor({ runtime = null } = {}) {
    this.runtime = runtime;
    this.healthMonitor = new HealthMonitor({ runtime });
    this.metricsService = new MetricsService();
    this.alertService = new AlertService();
    this.systemDashboard = new SystemDashboard({
      healthMonitor: this.healthMonitor,
      metricsService: this.metricsService,
      alertService: this.alertService
    });
  }

  build() {
    return {
      ...this.systemDashboard.build(),
      status: "READY"
    };
  }

  snapshot() {
    return this.build();
  }
}
