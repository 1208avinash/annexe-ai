import EventBus from "../../events/event-bus.js";
import EventStream from "../../events/event-stream.js";
import EventConsumer from "../../events/event-consumer.js";

export default class KafkaEventAdapter {
  constructor({ topic = "annexe-events", eventBus = new EventBus() } = {}) {
    this.topic = topic;
    this.eventBus = eventBus;
    this.eventStream = new EventStream({ eventBus: this.eventBus });
    this.eventConsumer = new EventConsumer({ eventStream: this.eventStream });
  }

  publish(eventType, payload = {}) {
    return this.eventStream.emit(eventType, {
      topic: this.topic,
      ...payload
    });
  }

  subscribe(eventType, listener) {
    return this.eventBus.subscribe(eventType, listener);
  }

  consume() {
    return {
      topic: this.topic,
      ...this.eventConsumer.consume()
    };
  }

  snapshot() {
    return {
      topic: this.topic,
      events: this.eventStream.list(),
      status: "READY"
    };
  }
}
