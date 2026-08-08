// ── ANNEXE AI — Autonomous Orchestrator Flow Test ───────────────────────────
//
// Phase 9.2 contract test.
//
// Verifies:
//
// DecisionEngine
//      ↓
// WorkflowPlanner
//      ↓
// WorkflowManager
//      ↓
// WorkflowRunner
//      ↓
// Executable Tasks
//
// Does NOT execute agents.
//
// Run:
// node test-autonomous-orchestrator-flow.js


import { DecisionEngine }       from "./lib/orchestrator/decision-engine.js";
import { WorkflowPlanner }      from "./lib/orchestrator/planner.js";
import { WorkflowManager }      from "./lib/orchestrator/workflow.js";
import { WorkflowRunner }       from "./lib/orchestrator/workflow-runner.js";
import { WorkflowTaskGenerator } from "./lib/orchestrator/task-generator.js";


let passed = 0;
let failed = 0;


function assert(label, condition, actual) {

  if (condition) {

    console.log(`  ✅  ${label}`);
    passed++;

  } else {

    console.error(`  ❌  ${label} → got: ${JSON.stringify(actual)}`);
    failed++;

  }

}


console.log("\n════════════════════════════════════════");
console.log("  Phase 9.2 — Autonomous Orchestrator Flow");
console.log("════════════════════════════════════════");


// ── Stage 1 — Decision ─────────────────────────────────────────

console.log("\n── Stage 1 — Decision Engine ─────────────\n");


const decisionEngine = new DecisionEngine();

const decision = decisionEngine.analyze({
  name: "AI SaaS Platform",
  description: "Multi tenant AI subscription platform",
  requirements: [
    "authentication",
    "billing",
    "dashboard"
  ]
});


assert(
  "decision succeeds",
  decision?.success === true,
  decision
);


assert(
  "decision detects saas",
  decision?.projectType === "saas",
  decision?.projectType
);


// ── Stage 2 — Planner ──────────────────────────────────────────

console.log("\n── Stage 2 — Workflow Planner ─────────────\n");


const planner = new WorkflowPlanner();


const plan = planner.createWorkflowPlan(
  {
    name: "AI SaaS Platform",
    requirements: [
      "authentication",
      "billing"
    ]
  },
  decision.projectType
);


assert(
  "workflow plan exists",
  !!plan
);


assert(
  "planner respects decision type",
  plan.projectType === decision.projectType,
  {
    plan: plan.projectType,
    decision: decision.projectType
  }
);


assert(
  "plan contains tasks",
  Array.isArray(plan.tasks) && plan.tasks.length > 0,
  plan.tasks
);


// ── Stage 3 — Workflow Manager ─────────────────────────────────

console.log("\n── Stage 3 — Workflow Manager ─────────────\n");


const workflowManager = new WorkflowManager();


const workflow = workflowManager.createWorkflow(
  "PHASE9-TEST-001",
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


assert(
  "workflow project preserved",
  workflow.projectId === "PHASE9-TEST-001",
  workflow.projectId
);


// ── Stage 4 — Workflow Runner ──────────────────────────────────

console.log("\n── Stage 4 — Workflow Runner ─────────────\n");


const generator = new WorkflowTaskGenerator();

const runner = new WorkflowRunner(generator);


const run = runner.createRun(workflow);


assert(
  "workflow run created",
  run.success === true,
  run
);


assert(
  "run contains executable tasks",
  Array.isArray(run.tasks) && run.tasks.length > 0,
  run.tasks
);


assert(
  "tasks contain agents",
  run.tasks.every(t => t.agent),
  run.tasks
);


// ── Summary ────────────────────────────────────────────────────


console.log("\n════════════════════════════════════════");
console.log(`  Phase 9.2 Test — ${passed} passed, ${failed} failed`);

if (failed === 0) {

  console.log("  ✅ AUTONOMOUS ORCHESTRATOR FLOW PASSED");

} else {

  console.log("  ❌ AUTONOMOUS ORCHESTRATOR FLOW FAILED");

}

console.log("════════════════════════════════════════\n");


process.exit(failed === 0 ? 0 : 1);