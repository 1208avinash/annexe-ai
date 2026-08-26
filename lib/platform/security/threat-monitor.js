export default class ThreatMonitor {
  inspect(activity = {}) {
    const suspicious = Boolean(activity.failedLogins > 5 || activity.unusualRegion);
    return {
      suspicious,
      severity: suspicious ? "high" : "low",
      inspectedAt: new Date().toISOString()
    };
  }
}
