export default class AuditService {
  constructor({ databaseManager, eventService = null } = {}) {
    this.databaseManager = databaseManager;
    this.eventService = eventService;
  }

  record({
    actorId = null,
    action,
    entityType,
    entityId = null,
    metadata = {}
  } = {}) {
    const entry = this.databaseManager.insert("auditLogs", {
      actorId,
      action,
      entityType,
      entityId,
      metadata
    });

    if (this.eventService) {
      this.eventService.publish("audit", "audit.recorded", entry);
    }

    return entry;
  }
}
