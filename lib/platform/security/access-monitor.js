export default class AccessMonitor {
  record(entry = {}) {
    return {
      ...entry,
      recordedAt: new Date().toISOString()
    };
  }
}
