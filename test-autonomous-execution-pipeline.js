// ── ANNEXE AI — Full Autonomous Execution Pipeline Test ───────────────────────
//
// Verifies the complete Phase 4 autonomous path:
//
//   WorkflowPlanner
//     → WorkflowScheduler
//       → AgentExecutor
//         → AgentRegistry  (execute shim)
//           → execution_worker
//             → ResultManager
//
// Does NOT call real npm/pip commands — execution_worker is mocked via
// registerAgent() for Stages 3 and 4.
//
// Run:
//   node test-autonomous-execution-pipeline.js
//
// ─────────────────────────────────────────────────────────────────────────────

import { WorkflowPlanner }  from "./lib/orchestrator/planner.js";
import { WorkflowScheduler } from "./lib/orchestrator/scheduler.js";
import { AgentExecutor }    from "./lib/orchestrator/executor.js";
import { registerAgent }    from "./lib/orchestrator/agents.js";


// ── Assertion helper ──────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}


// ════════════════════════════════════════════════════════════════════════════
// Stage 1 — Planner
// ════════════════════════════════════════════════════════════════════════════

console.log("\n════════════════════════════════════════════════════════════════");
console.log("  Stage 1 — Planner");
console.log("════════════════════════════════════════════════════════════════");

const planner = new WorkflowPlanner();

const plan = planner.createWorkflowPlan({
  name:         "ANNEXE Test App",
  requirements: ["dashboard", "api"]
});

const agentIds = plan.tasks.map(t => t.agent);

assert(
  "createWorkflowPlan returns a plan",
  plan !== null && plan !== undefined
);

assert(
  "plan contains tasks",
  Array.isArray(plan.tasks) && plan.tasks.length > 0
);

assert(
  "tasks contain execution_worker",
  agentIds.includes("execution_worker")
);

assert(
  "execution_worker appears before testing_worker",
  agentIds.indexOf("execution_worker") < agentIds.indexOf("testing_worker")
);

assert(
  "execution_worker appears after frontend_worker",
  agentIds.indexOf("execution_worker") > agentIds.indexOf("frontend_worker")
);


// ════════════════════════════════════════════════════════════════════════════
// Stage 2 — Scheduler
// ════════════════════════════════════════════════════════════════════════════

console.log("\n════════════════════════════════════════════════════════════════");
console.log("  Stage 2 — Scheduler");
console.log("════════════════════════════════════════════════════════════════");

const scheduler = new WorkflowScheduler();
scheduler.registerDependencies(plan.tasks);

// Locate the execution_worker task and its predecessor (frontend_worker)
const executionTask  = plan.tasks.find(t => t.agent === "execution_worker");
const frontendTask   = plan.tasks.find(t => t.agent === "frontend_worker");

assert(
  "execution_worker task exists in plan",
  executionTask !== undefined
);

assert(
  "frontend_worker task exists in plan",
  frontendTask !== undefined
);

// Before frontend completes — execution_worker must be blocked
const { readyTasks: readyBefore } = scheduler.schedule(
  plan.tasks,
  []   // nothing completed yet
);

const executionReadyBefore = readyBefore.some(t => t.agent === "execution_worker");

assert(
  "execution_worker is blocked before frontend_worker completes",
  executionReadyBefore === false
);

// Simulate all tasks up to and including frontend_worker completing
const completedUpToFrontend = plan.tasks
  .slice(0, plan.tasks.indexOf(frontendTask) + 1)
  .map(t => t.id);

const { readyTasks: readyAfter } = scheduler.schedule(
  plan.tasks,
  completedUpToFrontend
);

const executionReadyAfter = readyAfter.some(t => t.agent === "execution_worker");

assert(
  "execution_worker becomes ready after frontend_worker completes",
  executionReadyAfter === true
);


// ════════════════════════════════════════════════════════════════════════════
// Stage 3 — Executor registry compatibility  (mocked — no real commands)
// ════════════════════════════════════════════════════════════════════════════

console.log("\n════════════════════════════════════════════════════════════════");
console.log("  Stage 3 — Executor registry compatibility  (mocked)");
console.log("════════════════════════════════════════════════════════════════");

// Mock execution_worker — returns success without running npm/pip
registerAgent("execution_worker", async (_input) => ({
  success:  true,
  agent:    "execution_worker",
  name:     "execution_worker",
  status:   "BUILD_SUCCESS",
  executionReport: {
    environment: { runtime: "node" },
    commands:    [],
    logs:        {}
  }
}));

const executor = new AgentExecutor();

// Build a minimal task descriptor matching executor.executeTask() expectations
const execTask = {
  id:        executionTask.id,
  agent:     "execution_worker",
  type:      "EXECUTION",
  projectId: "TEST-PIPELINE-001",
  phase:     executionTask.phase
};

let executeError = null;
let execResult   = null;

try {
  execResult = await executor.executeTask(execTask);
} catch (err) {
  executeError = err.message;
}

assert(
  'executor does not throw "agent.execute is not a function"',
  executeError === null
);

assert(
  "executeTask returns a result object",
  execResult !== null && execResult !== undefined
);


// ════════════════════════════════════════════════════════════════════════════
// Stage 4 — ResultManager
// ════════════════════════════════════════════════════════════════════════════

console.log("\n════════════════════════════════════════════════════════════════");
console.log("  Stage 4 — ResultManager");
console.log("════════════════════════════════════════════════════════════════");

assert(
  "success === true",
  execResult?.success === true
);

assert(
  'status === "COMPLETED"',
  execResult?.status === "COMPLETED"
);

assert(
  "result exists",
  execResult?.result !== null && execResult?.result !== undefined
);

assert(
  "taskId matches execution task",
  execResult?.taskId === executionTask.id
);


// ════════════════════════════════════════════════════════════════════════════
// Summary
// ════════════════════════════════════════════════════════════════════════════

const total = passed + failed;

console.log("\n════════════════════════════════════════════════════════════════");

if (failed === 0) {
  console.log(`  ✅  ${passed} passed, 0 failed`);
  console.log("  FULL AUTONOMOUS EXECUTION PIPELINE TEST PASSED");
} else {
  console.log(`  ✅  ${passed} passed   ❌  ${failed} failed   (${total} total)`);
  console.log("  FULL AUTONOMOUS EXECUTION PIPELINE TEST FAILED");
}

console.log("════════════════════════════════════════════════════════════════\n");
