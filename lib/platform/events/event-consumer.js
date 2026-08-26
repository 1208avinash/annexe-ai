export default class EventConsumer {
  constructor({ eventStream } = {}) {
    this.eventStream = eventStream;
  }

  consume() {
    return {
      consumedCount: this.eventStream?.list?.().length || 0,
      status: "active"
    };
  }
}
