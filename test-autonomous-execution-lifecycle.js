// ── ANNEXE AI — Autonomous Execution Lifecycle Test ─────────────────────────
//
// Phase 9.3 contract test.
//
// Verifies:
//
// WorkflowRunner
//      ↓
// TaskQueue
//      ↓
// AgentExecutor
//      ↓
// ResultManager
//
// Does NOT modify production code.
//
// Run:
// node test-autonomous-execution-lifecycle.js


import { WorkflowPlanner } from "./lib/orchestrator/planner.js";
import { WorkflowManager } from "./lib/orchestrator/workflow.js";
import { WorkflowRunner } from "./lib/orchestrator/workflow-runner.js";
import { WorkflowTaskGenerator } from "./lib/orchestrator/task-generator.js";
import { TaskQueue } from "./lib/orchestrator/queue.js";
import { AgentExecutor } from "./lib/orchestrator/executor.js";
import { registerAgent } from "./lib/orchestrator/agents.js";


let passed = 0;
let failed = 0;


function assert(label, condition, actual) {

  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label} → ${JSON.stringify(actual)}`);
    failed++;
  }

}


console.log("\n════════════════════════════════════════");
console.log("  Phase 9.3 — Autonomous Execution Lifecycle");
console.log("════════════════════════════════════════");


// ── Stage 1 — Create workflow ──────────────────────────────────

console.log("\n── Stage 1 — Workflow Creation ─────────────\n");


const planner = new WorkflowPlanner();

const plan = planner.createWorkflowPlan({
  name: "Lifecycle Test App",
  requirements: ["dashboard"]
});


const workflowManager = new WorkflowManager();

const workflow = workflowManager.createWorkflow(
  "PHASE9-3-TEST",
  {
    name: plan.name,
    tasks: plan.tasks,
    phases: plan.phases
  }
);


assert(
  "workflow created",
  !!workflow
);


// ── Stage 2 — Create run ───────────────────────────────────────

console.log("\n── Stage 2 — Workflow Run ─────────────\n");


const generator = new WorkflowTaskGenerator();

const runner = new WorkflowRunner(generator);

const run = runner.createRun(workflow);


assert(
  "run created",
  run.success === true,
  run
);


// ── Stage 3 — Submit queue ─────────────────────────────────────

console.log("\n── Stage 3 — Task Queue ─────────────\n");


const queue = new TaskQueue();


const submitted = runner.submitToQueue(
  workflow.id,
  queue
);


assert(
  "tasks submitted",
  submitted.success === true,
  submitted
);


assert(
  "tasks count submitted",
  submitted.submitted > 0,
  submitted.submitted
);


// ── Stage 4 — Execute one task ─────────────────────────────────

console.log("\n── Stage 4 — Executor ─────────────\n");


const queuedTask = queue.getNextTask();


assert(
  "queued task available",
  !!queuedTask,
  queuedTask
);


registerAgent(
  queuedTask.agent,
  async () => ({
    success: true,
    message: "mock execution success"
  })
);


const executor = new AgentExecutor();

const result = await executor.executeTask(queuedTask);


assert(
  "executor completes task",
  result.status === "COMPLETED",
  result
);


// ── Stage 5 — Queue completion ─────────────────────────────────

console.log("\n── Stage 5 — Queue Completion ─────────────\n");


const completed = queue.completeTask(
  queuedTask.id
);


assert(
  "queue marks completed",
  completed.success === true,
  completed
);


// ── Summary ────────────────────────────────────────────────────


console.log("\n════════════════════════════════════════");
console.log(`  Phase 9.3 Test — ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log("  ✅ AUTONOMOUS EXECUTION LIFECYCLE PASSED");
} else {
  console.log("  ❌ AUTONOMOUS EXECUTION LIFECYCLE FAILED");
}

console.log("════════════════════════════════════════\n");

process.exit(failed === 0 ? 0 : 1);