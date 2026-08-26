export default class ProjectStreamService {
  constructor({ eventService, notificationService } = {}) {
    this.eventService = eventService;
    this.notificationService = notificationService;
  }

  publishProjectUpdate({
    projectId,
    eventType,
    payload = {},
    userId = null
  } = {}) {
    const event = this.eventService.publish(`project:${projectId}`, eventType, {
      projectId,
      ...payload
    });

    if (userId && this.notificationService) {
      this.notificationService.notify({
        userId,
        title: `Project update for ${projectId}`,
        message: eventType,
        channel: "project-stream"
      });
    }

    return event;
  }
}
