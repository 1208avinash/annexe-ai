// ───────────────────────────────────────────────────────────────
// ANNEXE AI V8
// RC-8.1.2
// Workflow Generator Integration Test
// ───────────────────────────────────────────────────────────────

import PlanningEngine
    from "./lib/planning-engine/planning-engine.js";

import WorkflowGenerator
    from "./lib/workflow/workflow-generator.js";

console.log("\n═══════════════════════════════════════════════");
console.log(" ANNEXE AI — Workflow Generator Test");
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
    // Create Engineering Plan
    // ----------------------------------------------------------

    const planner =
        new PlanningEngine();

    const plan =
        planner.createPlan(decision);

    if (!plan)
        throw new Error("Engineering plan not created.");

    console.log("✅ Engineering Plan");

    // ----------------------------------------------------------
    // Generate Workflow
    // ----------------------------------------------------------

    const generator =
        new WorkflowGenerator();

    const workflow =
        generator.generate(plan);

    if (!workflow)
        throw new Error("Workflow not created.");

    // ----------------------------------------------------------
    // Contract Validation
    // ----------------------------------------------------------

    if (!workflow.workflowId)
        throw new Error("workflowId missing");

    if (!workflow.projectId)
        throw new Error("projectId missing");

    if (!workflow.planId)
        throw new Error("planId missing");

    if (!Array.isArray(workflow.stages))
        throw new Error("Stages missing");

    if (!Array.isArray(workflow.pendingTasks))
        throw new Error("Pending queue missing");

    if (!Array.isArray(workflow.completedTasks))
        throw new Error("Completed queue missing");

    if (!Array.isArray(workflow.failedTasks))
        throw new Error("Failed queue missing");

    console.log("✅ Executable Workflow");

    console.log("\n══════════════════════════════════════");
    console.log(" WORKFLOW SUMMARY");
    console.log("══════════════════════════════════════");

    console.log("Workflow ID:",
        workflow.workflowId);

    console.log("Project ID:",
        workflow.projectId);

    console.log("Plan ID:",
        workflow.planId);

    console.log("Stages:",
        workflow.stages.length);

    console.log("Pending Tasks:",
        workflow.pendingTasks.length);

    console.log("Progress:",
        workflow.progress + "%");

    console.log("\n🎉 WORKFLOW GENERATOR PASSED\n");

}
catch (error) {

    console.error("\n❌ WORKFLOW GENERATOR FAILED\n");

    console.error(error);

    process.exit(1);

}