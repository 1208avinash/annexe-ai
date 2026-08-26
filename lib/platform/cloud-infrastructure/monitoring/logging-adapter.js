export default class LoggingAdapter {
  constructor({ channel = "cloud-infrastructure" } = {}) {
    this.channel = channel;
    this.entries = [];
  }

  log(level, message, metadata = {}) {
    const entry = {
      channel: this.channel,
      level,
      message,
      metadata,
      loggedAt: new Date().toISOString()
    };
    this.entries.push(entry);
    return entry;
  }

  snapshot() {
    return {
      channel: this.channel,
      entries: [...this.entries],
      status: "READY"
    };
  }
}
