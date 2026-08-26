export default class AlertService {
  constructor() {
    this.alerts = [];
  }

  raise(type, message) {
    const alert = {
      type,
      message,
      createdAt: new Date().toISOString()
    };
    this.alerts.push(alert);
    return alert;
  }
}
