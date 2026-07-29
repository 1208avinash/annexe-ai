/*
  ANNEXE AI — Autonomous Orchestrator
  FILE: api/orchestrator/workers.js

  WorkerManager
  Manages AI worker registration and task assignment.
  In-memory only. No database. No external dependencies.
*/


/*
  Supported worker types
*/

export const WORKER_TYPES = [
  "frontend_worker",
  "backend_worker",
  "database_worker",
  "ai_worker",
  "testing_worker",
  "review_worker",
  "repository_worker"
];


/*
  Worker status values
*/

export const WORKER_STATUSES = {
  AVAILABLE: "AVAILABLE",
  BUSY:      "BUSY",
  OFFLINE:   "OFFLINE"
};


/*
  In-memory worker store
*/

const workerStore = new Map(); // workerId → worker


/*
  generateWorkerId()
*/

function generateWorkerId(agent) {
  return `WRK-${agent}-${Date.now()}`;
}


/*
  WorkerManager

  Registers AI workers and matches them to queued tasks.
*/

export class WorkerManager {


  constructor() {

    this.registerDefaultWorkers();

  }


  /*
    registerDefaultWorkers()

    Seeds one AVAILABLE worker per supported agent type.
    Called automatically on instantiation so the orchestrator
    can process tasks immediately without manual registration.
  */

  registerDefaultWorkers() {

    for (const agent of WORKER_TYPES) {

      const id = `WRK-${agent}-default`;

      const record = {
        id,
        agent,
        status:       WORKER_STATUSES.AVAILABLE,
        currentTask:  null,
        registeredAt: new Date().toISOString()
      };

      workerStore.set(id, record);

    }

    console.log(
      "ANNEXE WORKER MANAGER — Default workers registered:",
      WORKER_TYPES.length
    );

  }


  /*
    registerWorker(worker)

    Registers an AI worker.

    worker input:
    {
      agent:  string  (must be in WORKER_TYPES)
      id?:    string  (auto-generated if omitted)
    }

    Returns the stored worker record.
  */

  registerWorker(worker) {

    if (!worker || !worker.agent) {
      return {
        success: false,
        error:   "Worker requires an agent type"
      };
    }

    if (!WORKER_TYPES.includes(worker.agent)) {
      return {
        success: false,
        error:   `Unknown agent type '${worker.agent}'. Allowed: ${WORKER_TYPES.join(", ")}`
      };
    }

    const id = worker.id || generateWorkerId(worker.agent);

    const record = {
      id,
      agent:       worker.agent,
      status:      WORKER_STATUSES.AVAILABLE,
      currentTask: null,
      registeredAt: new Date().toISOString()
    };

    workerStore.set(id, record);

    console.log(
      "ANNEXE WORKER MANAGER — Worker registered:",
      id,
      record.agent
    );

    return {
      success: true,
      worker:  record
    };

  }


  /*
    assignTask(task)

    Finds an available worker compatible with the task's agent type
    and assigns the task to it.

    task: { id, agent, ... }

    Returns: { success, workerId, taskId }
  */

  assignTask(task) {

    if (!task || !task.agent || !task.id) {
      return {
        success: false,
        error:   "Task requires id and agent fields"
      };
    }

    // Find first available worker for this agent type
    const worker = Array.from(workerStore.values()).find(
      w =>
        w.agent  === task.agent &&
        w.status === WORKER_STATUSES.AVAILABLE
    );

    if (!worker) {
      return {
        success: false,
        error:   `No available worker for agent type '${task.agent}'`
      };
    }

    // Mark worker as busy
    worker.status      = WORKER_STATUSES.BUSY;
    worker.currentTask = task.id;
    worker.assignedAt  = new Date().toISOString();

    console.log(
      "ANNEXE WORKER MANAGER — Task assigned:",
      task.id,
      "→",
      worker.id
    );

    return {
      success:  true,
      workerId: worker.id,
      taskId:   task.id
    };

  }


  /*
    releaseWorker(workerId)

    Returns a worker to AVAILABLE status after task completion.
  */

  releaseWorker(workerId) {

    const worker = workerStore.get(workerId);

    if (!worker) {
      return {
        success: false,
        error:   `Worker '${workerId}' not found`
      };
    }

    worker.status      = WORKER_STATUSES.AVAILABLE;
    worker.currentTask = null;
    worker.assignedAt  = null;

    console.log(
      "ANNEXE WORKER MANAGER — Worker released:",
      workerId
    );

    return {
      success: true,
      worker
    };

  }


  /*
    getWorkers()

    Returns all registered workers.
  */

  getWorkers() {
    return Array.from(workerStore.values());
  }


  /*
    findAvailableWorker(agentType)

    Returns the first available worker for a given agent type, or null.
  */

  findAvailableWorker(agentType) {

    return Array.from(workerStore.values()).find(
      w =>
        w.agent  === agentType &&
        w.status === WORKER_STATUSES.AVAILABLE
    ) || null;

  }

}
