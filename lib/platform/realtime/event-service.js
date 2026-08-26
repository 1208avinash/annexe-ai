import { EventEmitter } from "events";
import crypto from "crypto";

export default class EventService {
  constructor({ databaseManager } = {}) {
    this.databaseManager = databaseManager;
    this.emitter = new EventEmitter();
  }

  publish(stream, eventType, payload = {}) {
    const event = {
      eventId: `EVT-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      stream,
      eventType,
      payload,
      createdAt: new Date().toISOString()
    };

    if (this.databaseManager) {
      this.databaseManager.insert("events", {
        stream,
        eventType,
        payload
      });
    }

    this.emitter.emit(stream, event);
    this.emitter.emit("*", event);
    return event;
  }

  subscribe(stream, listener) {
    this.emitter.on(stream, listener);
    return () => this.emitter.off(stream, listener);
  }
}
