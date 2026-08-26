import { EventEmitter } from "events";

export default class EventBus {
  constructor() {
    this.emitter = new EventEmitter();
  }

  publish(eventType, payload = {}) {
    const event = {
      eventType,
      payload,
      createdAt: new Date().toISOString()
    };
    this.emitter.emit(eventType, event);
    this.emitter.emit("*", event);
    return event;
  }

  subscribe(eventType, listener) {
    this.emitter.on(eventType, listener);
    return () => this.emitter.off(eventType, listener);
  }
}
