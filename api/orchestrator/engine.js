// ── ANNEXE AI — Orchestrator Engine ──────────────────────────────────────────
//
// Central execution engine for the ANNEXE autonomous agent pipeline.
//
// Workflow:
//   Workflow Agent Name  (e.g. architect_agent)
//         ↓
//   AgentMapper          (resolves to execution worker name)
//         ↓
//   architect_worker
//         ↓
//   WorkerManager        (assigns task to available worker)
//         ↓
//   AgentExecutor        (runs the agent logic)
//
// ─────────────────────────────────────────────────────────────────────────────

import { TaskQueue }    from "./queue.js";
import { WorkerManager } from "./workers.js";
import { AgentExecutor } from "./executor.js";
import { AgentMapper }   from "./agent-mapper.js";   // [PATCH 1] AgentMapper import
import GovernanceFramework from "./governance.js";
import engineeringPlugin from "./plugins/engineering-plugin.js";

export class AutonomousOrchestrator {

  // ── Constructor ─────────────────────────────────────────────────────────────

  constructor() {

    this.taskQueue     = new TaskQueue();
    this.workerManager = new WorkerManager();
    this.executor      = new AgentExecutor();
    this.agentMapper = new AgentMapper(); // [PATCH 2]

this.governance = new GovernanceFramework();

this.governance.register(engineeringPlugin);

this.running = false;
  }


  // ── Queue a new task ────────────────────────────────────────────────────────

 /**
 * addTask
 *
 * Accepts a workflow task and pushes it onto the queue.
 * The task.agent value may be a workflow task or worker.
 *
 * @param {object} task
 * @returns {object}
 */
addTask(task) {

    const result = this.taskQueue.addTask(task);

    if (!result.success) {

        console.error(
            "[OrchestratorEngine] Failed to queue task:",
            result.error
        );

        return result;

    }

    const queued = result.task;

    console.log(
        `[OrchestratorEngine] Task queued: ${queued.id} | agent: ${queued.agent}`
    );

    this.emit("task:queued", {
        taskId: queued.id,
        agent: queued.agent
    });

    return queued;

}

  // ── Process next task ───────────────────────────────────────────────────────

  /**
   * processNext
   *
   * Pulls the next task from the queue, resolves its workflow agent name to an
   * execution worker type via AgentMapper, then dispatches to WorkerManager
   * and AgentExecutor using the mapped worker name.
   *
   * Original task identity (id, queue state, events) is always preserved.
   *
   * @returns {object|null} execution result or null when queue is empty
   */
  async processNext() {

    // ── Dequeue ───────────────────────────────────────────────────────────────

    const task = this.taskQueue.getNextTask();

    if (!task) {
      return null;
    }

    // [PATCH 3] Map workflow agent name → execution worker type
    const mappedTask = {
      ...task,
      agent: this.agentMapper.mapAgent(task.agent)
    };

    console.log(
      `[OrchestratorEngine] Dispatching task: ${task.id} | ` +
      `${task.agent} → ${mappedTask.agent}`
    );

    this.emit("task:started", { taskId: task.id, agent: task.agent });

    try {

      // ─────────────────────────────────────────────────────
// Governance Review
// ─────────────────────────────────────────────────────

const governanceDecision =
    await this.governance.review(mappedTask);

if (!governanceDecision.allowed) {

    console.warn(
        "[Governance] Task blocked:",
        mappedTask.id,
        governanceDecision
    );

    this.emit("task:blocked", {

        taskId: mappedTask.id,

        decision: governanceDecision

    });

    this.taskQueue.failTask(
        task.id,
        new Error("Blocked by governance")
    );

    return {

        success: false,

        status: "BLOCKED",

        governance: governanceDecision

    };

}

// Continue normal execution

this.workerManager.assignTask(mappedTask);

const result =
    await this.executor.executeTask(mappedTask);

      // Preserve original task id for queue update
      this.taskQueue.completeTask(task.id);

      console.log(
        `[OrchestratorEngine] Task complete: ${task.id} | worker: ${mappedTask.agent}`
      );

      // Preserve original task agent name in event
      this.emit("task:completed", { taskId: task.id, agent: task.agent, result });

      return result;

    } catch (error) {

      console.error(
        `[OrchestratorEngine] Task failed: ${task.id} | worker: ${mappedTask.agent}`,
        error
      );

      // Preserve original task id for queue update
      this.taskQueue.failTask(task.id, error);

      // Preserve original task agent name in event
      this.emit("task:failed", {
        taskId: task.id,
        agent:  task.agent,
        error:  error instanceof Error ? error.message : String(error)
      });

      throw error;

    }

  }


  // ── Run loop ────────────────────────────────────────────────────────────────

  /**
   * start
   *
   * Begins continuous processing of the task queue.
   */
  async start() {

    this.running = true;

    console.log("[OrchestratorEngine] Engine started.");

    this.emit("engine:started", {});

    while (this.running) {

      const result = await this.processNext();

      if (!result) {
        // Queue empty — idle until next addTask()
        await this._idle();
      }

    }

  }


  /**
   * stop
   *
   * Signals the run loop to exit after the current task completes.
   */
  stop() {

    this.running = false;

    console.log("[OrchestratorEngine] Engine stopping.");

    this.emit("engine:stopped", {});

  }


  // ── Internal helpers ────────────────────────────────────────────────────────

  /**
   * _idle
   *
   * Short pause between empty-queue polls.
   * Replace with an event-driven wake mechanism in production.
   *
   * @param {number} [ms=200]
   */
  _idle(ms = 200) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  /**
   * emit
   *
   * Lightweight internal event emitter stub.
   * Replace with EventEmitter or a message bus in production.
   *
   * @param {string} event
   * @param {object} payload
   */
  emit(event, payload) {
    // Extend here: EventEmitter, WebSocket broadcast, Vercel KV pub/sub, etc.
    console.log(`[OrchestratorEngine] event: ${event}`, payload);
  }

}


// ── Default export ────────────────────────────────────────────────────────────

export default AutonomousOrchestrator;
