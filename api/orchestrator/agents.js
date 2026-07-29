// ── ANNEXE AI — Agent Registry ────────────────────────────────────────────────
//
// Central registry for all execution workers.
// Maps worker types to agent implementations.
//
// Registration priority:
//   1. Real adapter from agent-adapters.js  (preferred)
//   2. createDefaultAgent() mock fallback   (for unimplemented worker types)
//
// ─────────────────────────────────────────────────────────────────────────────

import { createAgentAdapters } from "./agent-adapters.js";   // [PATCH] real adapters


// ── Default worker types ──────────────────────────────────────────────────────
//
// Full list of worker types the registry initialises on startup.
// Do NOT modify this list — add new types here when new agents are built.

const DEFAULT_WORKER_TYPES = [
  "architect_worker",
  "backend_worker",
  "frontend_worker",
  "testing_worker",
  "review_worker",
  "ai_worker",
  "database_worker",
  "repository_worker",
  "generation_worker"
];


// ── Mock fallback factory ─────────────────────────────────────────────────────
//
// Returns a minimal executor-compatible agent for any worker type that does
// not yet have a real adapter. Keeps the pipeline runnable during development.

function createDefaultAgent(workerType) {

  return {

    name: workerType,

    async execute(task = {}) {

      console.log(
        `[AgentRegistry] Mock agent executing: ${workerType} | task: ${task.id || "unknown"}`
      );

      return {
        success: true,
        agent:   workerType,
        result:  {
          mock:      true,
          workerType,
          taskId:    task.id    || null,
          payload:   task.payload || task.input || task.data || {},
          note:      "Mock agent — real adapter not yet registered for this worker type"
        }
      };

    }

  };

}


// ── AgentRegistry class ───────────────────────────────────────────────────────

export class AgentRegistry {

  constructor() {

    // Internal store: workerType → agent adapter
    this.agentStore = new Map();

    this._registerDefaults();

  }


  // ── Default registration ────────────────────────────────────────────────────

  /**
   * _registerDefaults
   *
   * Registers all DEFAULT_WORKER_TYPES on startup.
   *
   * For each worker type:
   *   - If a real adapter exists in createAgentAdapters() → use it.
   *   - If no adapter exists                              → fall back to mock.
   */
  _registerDefaults() {

    // [PATCH 1] Load all real adapters up front
    const adapters = createAgentAdapters();

    for (const workerType of DEFAULT_WORKER_TYPES) {

      if (adapters[workerType]) {

        // [PATCH 2a] Real adapter found — register it
        this.agentStore.set(workerType, adapters[workerType]);

        console.log(
          `[AgentRegistry] Registered real adapter: ${workerType}`
        );

      } else {

        // [PATCH 2b] No adapter — keep mock fallback
        this.agentStore.set(workerType, createDefaultAgent(workerType));

        console.log(
          `[AgentRegistry] Registered mock fallback: ${workerType}`
        );

      }

    }

  }


  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * getAgent
   *
   * Returns the registered agent for a given worker type.
   * Returns null if the worker type is not registered.
   *
   * @param  {string} workerType
   * @returns {object|null}
   */
  getAgent(workerType) {

    const agent = this.agentStore.get(workerType) || null;

    if (!agent) {
      console.warn(
        `[AgentRegistry] No agent registered for worker type: ${workerType}`
      );
    }

    return agent;

  }


  /**
   * registerAgent
   *
   * Manually register or override an agent for a worker type.
   * Useful for testing or runtime hot-swapping.
   *
   * @param {string} workerType
   * @param {object} agent       - Must implement execute(task)
   */
  registerAgent(workerType, agent) {

    this.agentStore.set(workerType, agent);

    console.log(
      `[AgentRegistry] Agent registered (manual): ${workerType}`
    );

  }


  /**
   * listAgents
   *
   * Returns all registered worker types and whether they are real or mock.
   *
   * @returns {object[]}
   */
  listAgents() {

    const list = [];

    for (const [workerType, agent] of this.agentStore.entries()) {
      list.push({
        workerType,
        mock: agent.result?.mock === true || false
      });
    }

    return list;

  }


  /**
   * hasAgent
   *
   * @param  {string} workerType
   * @returns {boolean}
   */
  hasAgent(workerType) {
    return this.agentStore.has(workerType);
  }

}


// ── Default export ────────────────────────────────────────────────────────────

export default AgentRegistry;
