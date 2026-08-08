// ───────────────────────────────────────────────────────────────
// ANNEXE AI V8
// RC-8.4.1
// Execution Dispatcher Integration Test
// ───────────────────────────────────────────────────────────────

import PlanningEngine
    from "./lib/planning-engine/planning-engine.js";

import WorkflowGenerator
    from "./lib/workflow/workflow-generator.js";

import ExecutionEngine
    from "./lib/execution/execution-engine.js";

import ExecutionDispatcher
    from "./lib/dispatcher/execution-dispatcher.js";

import AIEngineerWorker
    from "./lib/workers/ai-engineer.js";

console.log("\n═══════════════════════════════════════════════");
console.log(" ANNEXE AI — Execution Dispatcher Test");
console.log("═══════════════════════════════════════════════\n");

try {

    // ----------------------------------------------------------
    // Mock Decision
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

    console.log("✅ Engineering Plan");

    // ----------------------------------------------------------
    // Workflow
    // ----------------------------------------------------------

    const workflowGenerator =
        new WorkflowGenerator();

    const workflow =
        workflowGenerator.generate(plan);

    console.log("✅ Executable Workflow");

    // ----------------------------------------------------------
    // Execution
    // ----------------------------------------------------------

    const executionEngine =
        new ExecutionEngine();

    const execution =
        executionEngine.start(workflow);

    console.log("✅ Execution Started");

    // ----------------------------------------------------------
    // Worker
    // ----------------------------------------------------------

    const worker =
        new AIEngineerWorker();

    console.log("✅ AI Engineer Worker");

    // ----------------------------------------------------------
    // Dispatcher
    // ----------------------------------------------------------

    const dispatcher =
        new ExecutionDispatcher();

    const dispatchResult =
        await dispatcher.dispatch(

            worker,

            workflow,

            execution

        );

    if (!dispatchResult.success)
        throw new Error("Dispatch failed.");

    console.log("✅ Dispatch Successful");

    // ----------------------------------------------------------
    // Worker Result
    // ----------------------------------------------------------

    if (!dispatchResult.result.success)
        throw new Error("Worker execution failed.");

    if (
        !dispatchResult.result.artifacts ||
        dispatchResult.result.artifacts.length === 0
    )
        throw new Error("No engineering artifact produced.");

    console.log("✅ Artifact Generated");

    // ----------------------------------------------------------
    // Summary
    // ----------------------------------------------------------

    console.log("\n══════════════════════════════════════");
    console.log(" EXECUTION LOOP SUMMARY");
    console.log("══════════════════════════════════════");

    console.log("Workflow:",
        workflow.workflowId);

    console.log("Execution:",
        execution.executionId);

    console.log("Worker:",
        dispatchResult.worker);

    console.log("Task:",
        dispatchResult.taskId);

    console.log("Artifacts:",
        dispatchResult.result.artifacts.length);

    console.log("Status:",
        dispatchResult.result.status);

    console.log("\n🎉 AUTONOMOUS EXECUTION LOOP PASSED\n");

}
catch (error) {

    console.error("\n❌ EXECUTION DISPATCHER FAILED\n");

    console.error(error);

    process.exit(1);

}