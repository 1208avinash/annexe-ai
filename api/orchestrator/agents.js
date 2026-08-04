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
  }],
["execution_worker", {
    id:      "execution_worker",
    run:     (input) => runAgentAdapter("execution_worker", input),
    version: 1
}],

["repair_worker", {
    id:      "repair_worker",
    run:     (input) => runAgentAdapter("repair_worker", input),
    version: 1
}],

["rebuild_worker", {
    id:      "rebuild_worker",
    run:     (input) => runAgentAdapter("rebuild_worker", input),
    version: 1
}],

["retest_worker", {
    id:      "retest_worker",
    run:     (input) => runAgentAdapter("retest_worker", input),
    version: 1
}],

["quality_gate_worker", {
    id:      "quality_gate_worker",
    run:     (input) => runAgentAdapter("quality_gate_worker", input),
    version: 1
}],

["rollback_worker", {
    id:      "rollback_worker",
    run:     (input) => runAgentAdapter("rollback_worker", input),
    version: 1
}],

["risk_worker", {
    id:      "risk_worker",
    run:     (input) => runAgentAdapter("risk_worker", input),
    version: 1
}],

["dependency_worker", {
    id:      "dependency_worker",
    run:     (input) => runAgentAdapter("dependency_worker", input),
    version: 1
}],

["architecture_validator_worker", {
    id:      "architecture_validator_worker",
    run:     (input) => runAgentAdapter("architecture_validator_worker", input),
    version: 1
}],

["security_worker", {
    id:      "security_worker",
    run:     (input) => runAgentAdapter("security_worker", input),
    version: 1
}],

["performance_worker", {
    id:      "performance_worker",
    run:     (input) => runAgentAdapter("performance_worker", input),
    version: 1
}],

["engineering_intelligence_worker", {
    id:      "engineering_intelligence_worker",
    run:     (input) => runAgentAdapter("engineering_intelligence_worker", input),
    version: 1
}],

["engineering_orchestrator_worker", {
    id:      "engineering_orchestrator_worker",
    run:     (input) => runAgentAdapter("engineering_orchestrator_worker", input),
    version: 1
}],

["requirement_intelligence_worker", {
    id: "requirement_intelligence_worker",
    run: (input) => runAgentAdapter("requirement_intelligence_worker", input),
    version: 1
}],

  // ------------------------------------------------------------------
  // Planner-generated workers
  // ------------------------------------------------------------------

  ["architect_agent", {
    id:      "architect_agent",
    run:     (input) => runAgentAdapter("architect_worker", input),
    version: 1
  }],

  ["testing_worker", {
    id:      "testing_worker",
    run:     (input) => runAgentAdapter("testing_worker", input),
    version: 1
  }],

  ["review_worker", {
    id:      "review_worker",
    run:     (input) => runAgentAdapter("review_worker", input),
    version: 1
  }],

  ["crm_worker", {
    id:      "crm_worker",
    run:     (input) => runAgentAdapter("generation_worker", input),
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


// ── AgentRegistry class ───────────────────────────────────────────────────────
//
// WHY: AgentExecutor calls `new AgentRegistry()` and `agent.execute(task)`.
// The flat registry above satisfies existing test contracts ({ id, run, version }).
// This class wraps the same AGENT_REGISTRY Map so both contracts are served
// from one source of truth — no duplication, no breakage.
//
// Returned entries expose:
//   id, run, version   — existing contract (tests, pipeline callers)
//   execute(input)     — new contract (AgentExecutor)

export class AgentRegistry {

  getAgent(workerId) {

    const entry = AGENT_REGISTRY.get(workerId);

    if (!entry) {
      return null;
    }

    return {

      ...entry,

      execute(input) {
        return entry.run(input);
      }

    };

  }

}