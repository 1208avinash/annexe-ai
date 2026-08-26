export default class RestoreManager {
  restore(snapshot = {}) {
    return {
      restored: true,
      source: snapshot.source ?? "backup",
      restoredAt: new Date().toISOString(),
      status: "READY"
    };
  }
}
