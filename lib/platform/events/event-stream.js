export default class EventStream {
  constructor({ eventBus } = {}) {
    this.eventBus = eventBus;
    this.events = [];
  }

  emit(eventType, payload = {}) {
    const event = this.eventBus.publish(eventType, payload);
    this.events.push(event);
    return event;
  }

  list() {
    return [...this.events];
  }
}
