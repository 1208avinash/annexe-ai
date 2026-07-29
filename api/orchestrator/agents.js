// ── ANNEXE AI — Agent Registry ────────────────────────────────────────────────
//
// Flat agent registry keyed by worker id.
// Each entry: { id, run, version }
//
// WHY flat instead of class:
//   test-debug-worker.js imports { getAgent } and asserts:
//     agentEntry.id      === "debug_worker"
//     agentEntry.run     is a function
//     agentEntry.version === 1
//   The previous AgentRegistry class shape did not satisfy this contract.
//
// ─────────────────────────────────────────────────────────────────────────────

import { run as runDebug }        from "../agents/debug/worker.js";
import { runAgentAdapter }        from "./agent-adapters.js";


// ── Registry ──────────────────────────────────────────────────────────────────
//
// Add new agents here. Each entry must have: id, run, version.

const AGENT_REGISTRY = new Map([

  ["debug_worker", {
    id:      "debug_worker",
    run:     runDebug,
    version: 1
  }],

  ["generation_worker", {
    id:      "generation_worker",
    run:     (input) => runAgentAdapter("generation_worker", input),
    version: 1
  }],

  ["repository_worker", {
    id:      "repository_worker",
    run:     (input) => runAgentAdapter("repository_worker", input),
    version: 1
  }],

  ["build_worker", {
    id:      "build_worker",
    run:     (input) => runAgentAdapter("build_worker", input),
    version: 1
  }],

  ["delivery_worker", {
    id:      "delivery_worker",
    run:     (input) => runAgentAdapter("delivery_worker", input),
    version: 1
  }],

  ["backend_worker", {
    id:      "backend_worker",
    run:     (input) => runAgentAdapter("backend_worker", input),
    version: 1
  }],

  ["frontend_worker", {
    id:      "frontend_worker",
    run:     (input) => runAgentAdapter("frontend_worker", input),
    version: 1
  }]

]);


// ── Public API ────────────────────────────────────────────────────────────────

/**
 * getAgent
 *
 * Returns the registered agent entry for a worker id.
 * Returns null if not found.
 *
 * @param  {string} workerId
 * @returns {{ id: string, run: function, version: number }|null}
 */
export function getAgent(workerId) {
  return AGENT_REGISTRY.get(workerId) || null;
}

/**
 * registerAgent
 *
 * Manually register or override an agent at runtime.
 * Useful for testing or hot-swapping.
 *
 * @param {string}   workerId
 * @param {function} runFn
 * @param {number}   [version=1]
 */
export function registerAgent(workerId, runFn, version = 1) {
  AGENT_REGISTRY.set(workerId, { id: workerId, run: runFn, version });
}

export default AGENT_REGISTRY;
