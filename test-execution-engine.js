// ───────────────────────────────────────────────────────────────
// ANNEXE AI V8
// RC-8.2.2
// Execution Engine Integration Test
// ───────────────────────────────────────────────────────────────

import PlanningEngine
    from "./lib/planning-engine/planning-engine.js";

import WorkflowGenerator
    from "./lib/workflow/workflow-generator.js";

import ExecutionEngine
    from "./lib/execution/execution-engine.js";

console.log("\n═══════════════════════════════════════════════");
console.log(" ANNEXE AI — Execution Engine Test");
console.log("═══════════════════════════════════════════════\n");

try {

    // ----------------------------------------------------------
    // Mock Engineering Decision
    // ----------------------------------------------------------

    const decision = {

        decisionId: "DEC-001",

        projectId: "PROJECT-001",

        approved: true

    };

    // ----------------------------------------------------------
    // Planning
    // ----------------------------------------------------------

    const planner =
        new PlanningEngine();

    const plan =
        planner.createPlan(decision);

    if (!plan)
        throw new Error("Engineering plan not created.");

    console.log("✅ Engineering Plan");

    // ----------------------------------------------------------
    // Workflow
    // ----------------------------------------------------------

    const workflowGenerator =
        new WorkflowGenerator();

    const workflow =
        workflowGenerator.generate(plan);

    if (!workflow)
        throw new Error("Executable workflow not created.");

    console.log("✅ Executable Workflow");

    // ----------------------------------------------------------
    // Execution
    // ----------------------------------------------------------

    const executionEngine =
        new ExecutionEngine();

    const execution =
        executionEngine.start(workflow);

    if (!execution)
        throw new Error("Execution state not created.");

    if (!execution.executionId)
        throw new Error("executionId missing");

    if (!execution.workflowId)
        throw new Error("workflowId missing");

    if (!execution.projectId)
        throw new Error("projectId missing");

    if (!execution.planId)
        throw new Error("planId missing");

    if (execution.totalTasks !== workflow.totalTasks)
        throw new Error("Task count mismatch");

    console.log("✅ Execution Started");

    // ----------------------------------------------------------
    // Complete Current Task
    // ----------------------------------------------------------

    if (execution.currentTask) {

        executionEngine.completeTask(

            execution,

            execution.currentTask

        );

        console.log("✅ Task Completion");

    }

    // ----------------------------------------------------------
    // Simulate Failure
    // ----------------------------------------------------------

    executionEngine.failTask(

        execution,

        "TASK-FAILED",

        "Integration test failure"

    );

    console.log("✅ Failure Handling");

    // ----------------------------------------------------------
    // Final Validation
    // ----------------------------------------------------------

    if (!Array.isArray(execution.history))
        throw new Error("History missing");

    if (!Array.isArray(execution.errors))
        throw new Error("Errors missing");

    console.log("\n══════════════════════════════════════");
    console.log(" EXECUTION SUMMARY");
    console.log("══════════════════════════════════════");

    console.log("Execution ID:",
        execution.executionId);

    console.log("Workflow ID:",
        execution.workflowId);

    console.log("Project ID:",
        execution.projectId);

    console.log("Plan ID:",
        execution.planId);

    console.log("Status:",
        execution.status);

    console.log("Current Worker:",
        execution.currentWorker);

    console.log("Current Task:",
        execution.currentTask);

    console.log("Completed:",
        execution.completedTasks);

    console.log("Failed:",
        execution.failedTasks);

    console.log("Progress:",
        execution.progress + "%");

    console.log("History Events:",
        execution.history.length);

    console.log("Errors:",
        execution.errors.length);

    console.log("\n🎉 EXECUTION ENGINE PASSED\n");

}
catch (error) {

    console.error("\n❌ EXECUTION ENGINE FAILED\n");

    console.error(error);

    process.exit(1);

}