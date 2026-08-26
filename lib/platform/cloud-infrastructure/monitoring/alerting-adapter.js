import AlertService from "../../monitoring/alert-service.js";

export default class AlertingAdapter {
  constructor({ alertService = new AlertService() } = {}) {
    this.alertService = alertService;
  }

  raise(type, message) {
    return this.alertService.raise(type, message);
  }

  snapshot() {
    return {
      alerts: [...this.alertService.alerts],
      status: "READY"
    };
  }
}
