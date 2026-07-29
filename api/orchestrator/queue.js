/*
  ANNEXE AI — Autonomous Orchestrator
  FILE: api/orchestrator/queue.js

  TaskQueue
  Manages agent task lifecycle with priority ordering.
  In-memory only. No database. No external dependencies.
*/


/*
  Task status values
*/

export const TASK_STATUSES = {
  QUEUED:    "QUEUED",
  ASSIGNED:  "ASSIGNED",
  RUNNING:   "RUNNING",
  COMPLETED: "COMPLETED",
  FAILED:    "FAILED"
};


/*
  Priority order map — lower number = higher priority
*/

const PRIORITY_ORDER = {
  CRITICAL: 1,
  HIGH:     2,
  MEDIUM:   3,
  LOW:      4
};


/*
  In-memory task store
*/

const taskStore = new Map(); // taskId → task


/*
  generateTaskId()
*/

function generateTaskId() {
  return "TSK-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}


/*
  TaskQueue

  FIFO queue with priority support for AI agent tasks.
*/

export class TaskQueue {


  /*
    addTask(task)

    Adds a task to the queue.

    task input:
    {
      projectId: string,
      type:      string,
      agent:     string,
      priority:  "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    }

    Returns the stored task record.
  */

  addTask(task) {

    if (!task || !task.projectId || !task.type || !task.agent) {
      return {
        success: false,
        error:   "Task requires projectId, type, and agent"
      };
    }

    const id = task.id || generateTaskId();

    const record = {
      id,
      projectId: task.projectId,
      type:      task.type,
      agent:     task.agent,
      priority:  task.priority || "MEDIUM",
      status:    TASK_STATUSES.QUEUED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    taskStore.set(id, record);

    console.log(
      "ANNEXE TASK QUEUE — Task queued:",
      id,
      record.type,
      record.priority
    );

    return {
      success: true,
      task:    record
    };

  }


  /*
    getNextTask()

    Returns the highest-priority QUEUED task.
    Priority: CRITICAL > HIGH > MEDIUM > LOW
    Tie-broken by createdAt (oldest first).
  */

  getNextTask() {

    const queued = Array.from(taskStore.values())
      .filter(t => t.status === TASK_STATUSES.QUEUED)
      .sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority] || 99;
        const pb = PRIORITY_ORDER[b.priority] || 99;
        if (pa !== pb) return pa - pb;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

    return queued[0] || null;

  }


  /*
    completeTask(id)

    Marks a task as COMPLETED.
  */

  completeTask(id) {

    return this._setStatus(id, TASK_STATUSES.COMPLETED);

  }


  /*
    failTask(id)

    Marks a task as FAILED.
  */

  failTask(id) {

    return this._setStatus(id, TASK_STATUSES.FAILED);

  }


  /*
    getTasks(projectId?)

    Returns all tasks, optionally filtered by projectId.
  */

  getTasks(projectId) {

    const all = Array.from(taskStore.values());

    if (projectId) {
      return all.filter(t => t.projectId === projectId);
    }

    return all;

  }


  /*
    _setStatus(id, status)

    Internal: updates a task's status field.
  */

  _setStatus(id, status) {

    const task = taskStore.get(id);

    if (!task) {
      return {
        success: false,
        error:   `Task '${id}' not found`
      };
    }

    task.status    = status;
    task.updatedAt = new Date().toISOString();

    console.log(
      "ANNEXE TASK QUEUE — Status update:",
      id,
      status
    );

    return {
      success: true,
      task
    };

  }


  /*
    _setStatusAssigned(id)

    Marks a task as ASSIGNED — called by WorkerManager.
  */

  _setStatusAssigned(id) {

    return this._setStatus(id, TASK_STATUSES.ASSIGNED);

  }

}
