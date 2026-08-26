export default class NotificationService {
  constructor({ eventService } = {}) {
    this.eventService = eventService;
  }

  notify({
    userId,
    title,
    message,
    channel = "in-app"
  } = {}) {
    return this.eventService.publish("notifications", "notification.created", {
      userId,
      title,
      message,
      channel
    });
  }
}
