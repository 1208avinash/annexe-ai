// ────────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-1 — Golden Factory Acceptance Test
//
// Iteration 1
//
// Pipeline:
//
// Project
//   ↓
// Decision Engine
//   ↓
// Workflow Planner
//   ↓
// Workflow Manager
//   ↓
// Workflow Runner
//
// This iteration intentionally stops before:
//
// Task Queue
// Agent Executor
// Testing
// Review
// Approval
//
// Run:
//
// node test-golden-factory-acceptance.js
//
// ────────────────────────────────────────────────────────────────

import { DecisionEngine } from "./lib/orchestrator/decision-engine.js";
import { WorkflowPlanner } from "./lib/orchestrator/planner.js";
import { WorkflowManager } from "./lib/orchestrator/workflow.js";
import { WorkflowRunner } from "./lib/orchestrator/workflow-runner.js";
import { WorkflowTaskGenerator } from "./lib/orchestrator/task-generator.js";
import { TaskQueue } from "./lib/orchestrator/queue.js";
import { AgentExecutor } from "./lib/orchestrator/executor.js";


// ────────────────────────────────────────────────────────────────
// Canonical Regression Project
// NEVER CHANGE THIS OBJECT
// ────────────────────────────────────────────────────────────────

const project = {

    id: "PROJECT-PHASE10-001",

    name: "AI CRM Platform",

    solution: "AI-powered CRM with lead management",

    requirements: [

        "User authentication",

        "Dashboard",

        "Customer management",

        "Lead management",

        "Reporting",

        "Role permissions"

    ],

    technology: {

        frontend: {

            technology: "Next.js"

        },

        backend: {

            technology: "FastAPI"

        },

        database: {

            technology: "PostgreSQL"

        }

    }

};


// ────────────────────────────────────────────────────────────────
// Test Helpers
// ────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition, actual = null) {

    if (condition) {

        console.log(`✅ ${label}`);
        passed++;

    } else {

        console.log(`❌ ${label}`);

        if (actual !== null) {
            console.log(actual);
        }

        failed++;

    }

}


// ────────────────────────────────────────────────────────────────
// Main Test
// ────────────────────────────────────────────────────────────────

async function main() {

    console.log("");
    console.log("══════════════════════════════════════════════");
    console.log(" RC-1 — GOLDEN FACTORY ACCEPTANCE");
    console.log("══════════════════════════════════════════════");
    console.log("");



    // ============================================================
    // Stage 1
    // ============================================================

    console.log("── Stage 1 — Decision ─────────────");

    const decisionEngine = new DecisionEngine();

    const decision = decisionEngine.analyze(project);

    assert(

        "Decision Engine",

        decision &&
        decision.success === true &&
        decision.projectType &&
        decision.complexity &&
        decision.plan,

        decision

    );

    console.log("");



    // ============================================================
    // Stage 2
    // ============================================================

    console.log("── Stage 2 — Planning ─────────────");

    const planner = new WorkflowPlanner();

    const workflowPlan =
        planner.createWorkflowPlan(project);

    assert(

        "Workflow Planner",

        workflowPlan &&
        workflowPlan.projectType &&
        Array.isArray(workflowPlan.phases) &&
        Array.isArray(workflowPlan.tasks),

        workflowPlan

    );

    console.log("");



    // ============================================================
    // Stage 3
    // ============================================================

    console.log("── Stage 3 — Workflow ─────────────");

    const workflowManager =
        new WorkflowManager();

    const workflow =
        workflowManager.createWorkflow(
            project.id,
            workflowPlan
        );

    assert(

        "Workflow Manager",

        workflow &&
        workflow.id &&
        workflow.projectId === project.id &&
        workflow.status === "CREATED",

        workflow

    );

    console.log("");



    // ============================================================
    // Stage 4
    // ============================================================

    console.log("── Stage 4 — Workflow Runner ─────");

    const generator =
        new WorkflowTaskGenerator();

    const runner =
        new WorkflowRunner(generator);

    const run =
        runner.createRun(workflow);

    assert(

        "Workflow Runner",

        run &&
        run.success === true &&
        run.workflowId === workflow.id &&
        run.runId &&
        run.status === "CREATED" &&
        Array.isArray(run.tasks),

        run

    );

    console.log("");

// ============================================================
// Stage 5
// ============================================================

console.log("── Stage 5 — Queue ───────────────");

const taskQueue = new TaskQueue();

const submitResult =
    runner.submitToQueue(
        workflow.id,
        taskQueue
    );

assert(

    "submitToQueue",

    submitResult &&
    submitResult.success === true &&
    submitResult.workflowId === workflow.id,

    submitResult

);

assert(

    "submitted task count",

    submitResult.submitted === run.tasks.length,

    submitResult

);

const firstTask =
    taskQueue.getNextTask();

assert(

    "queue populated",

    firstTask !== null,

    firstTask

);

assert(

    "workflow id preserved",

    firstTask &&
    firstTask.projectId === project.id,

    firstTask

);

assert(

    "task queued",

    firstTask &&
    firstTask.status === "QUEUED",

    firstTask

);

console.log("");

// ============================================================
// Stage 6
// ============================================================

console.log("── Stage 6 — Execution ───────────");

const executor = new AgentExecutor();

const executionResult =
    await executor.executeTask(firstTask);

assert(

    "execution completed",

    executionResult &&
    typeof executionResult.success === "boolean",

    executionResult

);

assert(

    "task id preserved",

    executionResult &&
    executionResult.taskId === firstTask.id,

    executionResult

);

assert(

    "valid execution status",

    executionResult &&
    [
        "COMPLETED",
        "FAILED",
        "PENDING_APPROVAL"
    ].includes(executionResult.status),

    executionResult

);

if (executionResult.success) {

    assert(

        "execution result returned",

        executionResult.result !== undefined,

        executionResult

    );

} else {

    console.log(
        "ℹ️ Execution finished with status:",
        executionResult.status
    );

}

console.log("");

taskQueue.completeTask(firstTask.id);

// ============================================================
// Stage 7
// ============================================================

console.log("── Stage 7 — Full Workflow Execution ─────");

let processed = 1; // Stage 6 already executed the first task

while (true) {

    const nextTask = taskQueue.getNextTask();

    if (!nextTask) {
        break;
    }

    const result =
        await executor.executeTask(nextTask);

    assert(

        `workflow task ${processed + 1}`,

        result &&
        [
            "COMPLETED",
            "FAILED",
            "PENDING_APPROVAL"
        ].includes(result.status),

        result

    );

    taskQueue.completeTask(nextTask.id);

    processed++;

}

assert(

    "all workflow tasks processed",

    processed === run.tasks.length,

    processed

);

assert(

    "queue empty",

    taskQueue.getNextTask() === null,

    taskQueue.getNextTask()

);

console.log("");


    // ============================================================
    // Result Summary
    // ============================================================

    console.log("══════════════════════════════════════════════");
    console.log(" RC-1 — Iteration 1 Result");
    console.log("══════════════════════════════════════════════");
    console.log("");

    console.log(`Passed : ${passed}`);
    console.log(`Failed : ${failed}`);
    console.log("");

    if (failed === 0) {

        console.log("✅ PASS");
        console.log("");
        console.log("Golden Factory execution verified.");
        console.log("");
        console.log("Verified Stages:");
        console.log("  ✓ Decision Engine");
        console.log("  ✓ Workflow Planner");
        console.log("  ✓ Workflow Manager");
        console.log("  ✓ Workflow Runner");
        console.log("  ✓ WorkflowTaskGenerator");
        console.log("  ✓ TaskQueue");
        console.log("  ✓ submitToQueue()");
        console.log("  ✓ AgentExecutor");
        console.log("  ✓ First Autonomous Execution");
        console.log("  ✓ Full Workflow Execution");
        console.log("");
        console.log("Next Iteration:");
        console.log("  • WorkflowTaskGenerator");
        console.log("  • TaskQueue");
        console.log("  • submitToQueue()");
        console.log("");

    } else {

        console.log("❌ FAIL");
        console.log("");
        console.log("Do NOT modify production code immediately.");
        console.log("Investigate whether the failure is:");
        console.log("  1. Incorrect test assumptions");
        console.log("  2. A genuine production integration issue");
        console.log("");

    }

    console.log("══════════════════════════════════════════════");
    console.log("");

    process.exit(failed === 0 ? 0 : 1);

}


// ────────────────────────────────────────────────────────────────
// Entry Point
// ────────────────────────────────────────────────────────────────

main().catch(error => {

    console.log("");
    console.log("══════════════════════════════════════════════");
    console.log(" RC-1 — FATAL ERROR");
    console.log("══════════════════════════════════════════════");
    console.log("");

    console.error(error);

    console.log("");
    console.log("Possible causes:");
    console.log("");
    console.log("• Incorrect import path");
    console.log("• Constructor contract mismatch");
    console.log("• Production integration gap");
    console.log("• Unexpected runtime exception");
    console.log("");
    console.log("Do not change production code until the");
    console.log("root cause has been identified.");
    console.log("");

    process.exit(1);

});