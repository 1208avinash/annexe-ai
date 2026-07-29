/*
  ANNEXE AI — Autonomous Orchestrator
  FILE: api/orchestrator/events.js

  EventBus
  Agent communication layer.
  Publish/subscribe event routing with in-memory storage.
  No external dependencies. No database.
*/


/*
  Known event types published across the pipeline
*/

export const EVENT_TYPES = {
  CODE_GENERATED:    "CODE_GENERATED",
  TEST_COMPLETED:    "TEST_COMPLETED",
  REVIEW_COMPLETED:  "REVIEW_COMPLETED",
  PR_CREATED:        "PR_CREATED",
  TASK_ASSIGNED:     "TASK_ASSIGNED",
  TASK_COMPLETED:    "TASK_COMPLETED",
  TASK_FAILED:       "TASK_FAILED",
  STATE_CHANGED:     "STATE_CHANGED",
  WORKER_REGISTERED: "WORKER_REGISTERED"
};


/*
  In-memory stores
*/

const eventStore     = [];                // All published events
const subscriptions  = new Map();         // eventType → [handler]


/*
  generateEventId()
*/

function generateEventId() {
  return "EVT-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}


/*
  EventBus

  Provides publish/subscribe agent communication.
*/

export class EventBus {


  /*
    publish(event)

    Publishes an event to all registered subscribers.

    event input:
    {
      type:      string,
      projectId: string,
      payload:   object
    }

    Returns the stored event record.
  */

  publish(event) {

    if (!event || !event.type) {
      console.error(
        "ANNEXE EVENT BUS — Publish rejected: missing type"
      );
      return null;
    }

    const record = {
      id:        generateEventId(),
      type:      event.type,
      projectId: event.projectId || null,
      payload:   event.payload   || {},
      createdAt: new Date().toISOString()
    };

    eventStore.push(record);

    console.log(
      "ANNEXE EVENT BUS — Published:",
      record.id,
      record.type,
      record.projectId || ""
    );

    // Notify subscribers
    const handlers = subscriptions.get(record.type) || [];

    for (const handler of handlers) {
      try {
        handler(record);
      }
      catch (err) {
        console.error(
          "ANNEXE EVENT BUS — Handler error for",
          record.type,
          err.message
        );
      }
    }

    return record;

  }


  /*
    subscribe(eventType, handler)

    Registers a handler function for a given event type.
    handler receives the full event record when triggered.
  */

  subscribe(eventType, handler) {

    if (typeof handler !== "function") {
      console.error(
        "ANNEXE EVENT BUS — Subscribe rejected: handler must be a function"
      );
      return;
    }

    if (!subscriptions.has(eventType)) {
      subscriptions.set(eventType, []);
    }

    subscriptions.get(eventType).push(handler);

    console.log(
      "ANNEXE EVENT BUS — Subscribed to:",
      eventType
    );

  }


  /*
    getEvents(projectId?)

    Returns all events, optionally filtered by projectId.
  */

  getEvents(projectId) {

    if (projectId) {
      return eventStore.filter(e => e.projectId === projectId);
    }

    return eventStore;

  }

}
