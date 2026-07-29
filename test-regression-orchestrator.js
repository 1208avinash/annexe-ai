/*
  REGRESSION TEST — ORCHESTRATOR CONTRACTS
  ==========================================
  Verifies that adding debug_worker did NOT break:
  - agent-mapper routes for all existing agents
  - agents registry shape for all existing agents
  - task-generator: existing phases still route correctly
  - agent-adapters: existing adapters still have correct shape
  - No existing orchestrator exports removed

  Run this in your dev environment alongside:
    node test-build-worker.js
    node test-delivery-worker.js
    node test-generation-worker.js
    node test-repository-worker.js
*/

import assert from "node:assert/strict";
import { AGENT_ROUTE_MAP, getAgentRoute, resolveAgentUrl } from "./api/orchestrator/agent-mapper.js";
import { AGENT_REGISTRY, getAgent }                        from "./api/orchestrator/agents.js";
import {
  generateDeliveryTask,
  generateBuildTask,
  generateGenerationTask,
  generateRepositoryTask,
  generateDebugTask,
  getNextTask
}                                                          from "./api/orchestrator/task-generator.js";
import {
  ADAPTER_MAP,
  getAdapter,
  generationWorkerAdapter,
  buildWorkerAdapter,
  repositoryWorkerAdapter,
  deliveryWorkerAdapter,
  debugWorkerAdapter
}                                                          from "./api/orchestrator/agent-adapters.js";


let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗  ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}


// ── agent-mapper regressions ──────────────────────────────────

console.log("\n━━━ agent-mapper regressions ━━━");

const EXPECTED_ROUTES = {
  generation_worker: "/api/agents/generation/worker",
  build_worker:      "/api/agents/build/worker",
  repository_worker: "/api/agents/repository/worker",
  delivery_worker:   "/api/agents/delivery/worker",
  debug_worker:      "/api/agents/debug/worker"
};

for (const [id, expectedRoute] of Object.entries(EXPECTED_ROUTES)) {
  test(`route exists for ${id}`, () => {
    assert.equal(getAgentRoute(id), expectedRoute);
  });
}

test("resolveAgentUrl: builds full URL correctly", () => {
  const url = resolveAgentUrl("build_worker", "https://my-app.vercel.app");
  assert.equal(url, "https://my-app.vercel.app/api/agents/build/worker");
});

test("resolveAgentUrl: unknown agent → null", () => {
  assert.equal(resolveAgentUrl("unknown_worker", "https://x.y"), null);
});


// ── agents registry regressions ───────────────────────────────

console.log("\n━━━ agents registry regressions ━━━");

const EXPECTED_AGENTS = [
  "delivery_worker",
  "build_worker",
  "generation_worker",
  "repository_worker",
  "debug_worker"
];

for (const id of EXPECTED_AGENTS) {
  test(`${id} in registry with correct shape`, () => {
    const agent = getAgent(id);
    assert.ok(agent,                           `${id} must be registered`);
    assert.equal(agent.id, id,                 "id must match key");
    assert.ok(typeof agent.run === "function", "run must be a function");
    assert.ok(agent.description,               "description required");
    assert.ok(typeof agent.version === "number", "version must be a number");
  });
}

test("getAgent: unknown id → null", () => {
  assert.equal(getAgent("nonexistent"), null);
});


// ── task-generator regressions ────────────────────────────────

console.log("\n━━━ task-generator regressions ━━━");

const PHASES = [
  { phase: "generation", expectedAgent: "generation_worker" },
  { phase: "build",      expectedAgent: "build_worker"      },
  { phase: "build_failed", expectedAgent: "debug_worker"    },
  { phase: "repository", expectedAgent: "repository_worker" },
  { phase: "delivery",   expectedAgent: "delivery_worker"   }
];

for (const { phase, expectedAgent } of PHASES) {
  test(`getNextTask(${phase}) → ${expectedAgent}`, () => {
    const state = {
      projectId:      `REGR-${phase}`,
      phase,
      architecture:   {},
      requirements:   [],
      generatedFiles: [],
      errorLogs:      "",
      buildReport:    ""
    };
    const task = getNextTask(state);
    assert.ok(task,                            `task must not be null for phase ${phase}`);
    assert.equal(task.agentId, expectedAgent,  `wrong agent for phase ${phase}`);
    assert.ok(task.taskId,                     "taskId required");
    assert.ok(typeof task.priority === "number", "priority must be number");
    assert.ok(task.input,                      "input required");
  });
}

test("getNextTask: unknown phase → null", () => {
  assert.equal(getNextTask({ phase: "unknown", projectId: "X" }), null);
});

test("generateDeliveryTask: shape correct", () => {
  const t = generateDeliveryTask({ projectId: "P1", generatedFiles: [], architecture: {} });
  assert.equal(t.agentId, "delivery_worker");
});

test("generateBuildTask: shape correct", () => {
  const t = generateBuildTask({ projectId: "P2", generatedFiles: [], architecture: {} });
  assert.equal(t.agentId, "build_worker");
});

test("generateGenerationTask: shape correct", () => {
  const t = generateGenerationTask({ projectId: "P3", architecture: {}, requirements: [] });
  assert.equal(t.agentId, "generation_worker");
});

test("generateRepositoryTask: shape correct", () => {
  const t = generateRepositoryTask({ projectId: "P4", generatedFiles: [] });
  assert.equal(t.agentId, "repository_worker");
});


// ── agent-adapters regressions ────────────────────────────────

console.log("\n━━━ agent-adapters regressions ━━━");

const EXPECTED_ADAPTERS = [
  "generation_worker",
  "build_worker",
  "repository_worker",
  "delivery_worker",
  "debug_worker"
];

for (const id of EXPECTED_ADAPTERS) {
  test(`${id} adapter in ADAPTER_MAP`, () => {
    const adapter = getAdapter(id);
    assert.ok(adapter,                                     `${id} adapter must exist`);
    assert.ok(typeof adapter.prepareInput  === "function", "prepareInput required");
    assert.ok(typeof adapter.processOutput === "function", "processOutput required");
  });
}

test("getAdapter: unknown → null", () => {
  assert.equal(getAdapter("unknown"), null);
});

// Verify existing adapter success paths still work (no regressions from build_worker changes)
test("buildWorkerAdapter success: phase → repository", () => {
  const state  = { projectId: "R1", generatedFiles: [] };
  const result = { success: true, artifacts: ["dist/app.js"] };
  const next   = buildWorkerAdapter.processOutput(state, result);
  assert.equal(next.phase, "repository");
  assert.ok(Array.isArray(next.buildArtifacts));
});

test("buildWorkerAdapter failure: phase → build_failed with errorLogs", () => {
  const state  = { projectId: "R2", generatedFiles: [] };
  const result = { success: false, errorLogs: "SyntaxError at line 5", buildReport: "" };
  const next   = buildWorkerAdapter.processOutput(state, result);
  assert.equal(next.phase, "build_failed");
  assert.ok(next.errorLogs.includes("SyntaxError"));
});

test("deliveryWorkerAdapter success: phase → complete", () => {
  const state  = { projectId: "R3" };
  const result = { success: true, deliveryUrl: "https://app.vercel.app" };
  const next   = deliveryWorkerAdapter.processOutput(state, result);
  assert.equal(next.phase, "complete");
  assert.ok(next.deliveryUrl);
});

test("generationWorkerAdapter success: phase → build", () => {
  const state  = { projectId: "R4" };
  const result = { success: true, files: ["src/index.js"] };
  const next   = generationWorkerAdapter.processOutput(state, result);
  assert.equal(next.phase, "build");
  assert.ok(Array.isArray(next.generatedFiles));
});

test("repositoryWorkerAdapter success: phase → delivery", () => {
  const state  = { projectId: "R5" };
  const result = { success: true, repositoryUrl: "https://github.com/org/repo" };
  const next   = repositoryWorkerAdapter.processOutput(state, result);
  assert.equal(next.phase, "delivery");
});


// ── Summary ───────────────────────────────────────────────────

console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ORCHESTRATOR REGRESSION RESULTS
  Passed: ${passed}
  Failed: ${failed}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

if (failed > 0) process.exit(1);
