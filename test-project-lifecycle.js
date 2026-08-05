// ───────────────────────────────────────────────────────────────
// ANNEXE AI V7
// RC-7.2
// Autonomous Project Lifecycle Test
// ───────────────────────────────────────────────────────────────

import { createProjectSchema } from "./api/projects/schema.js";
import { runProjectPipeline } from "./api/orchestrator/pipeline.js";
import { runEngineeringPipeline } from "./api/orchestrator/engineering-pipeline.js";

console.log("\n═══════════════════════════════════════════════");
console.log(" ANNEXE AI — Autonomous Project Lifecycle");
console.log("═══════════════════════════════════════════════\n");

try {

    // ----------------------------------------------------------
    // Create Project
    // ----------------------------------------------------------

    const project = createProjectSchema({

        clientName: "John Smith",

        companyName: "Healthcare CRM Ltd",

        industry: "Healthcare",

        status: "pipeline_pending",

        currentAgent: "requirement_agent"

    });

    project.challenge =
        "Small clinics need an online CRM system.";

    project.solution =
        "A SaaS CRM with appointments, patients, billing and reports.";

    project.blueprint = {};

    // ----------------------------------------------------------
    // Simulate client approval + payment
    // ----------------------------------------------------------

    project.approvalStatus = true;
    project.paymentStatus = true;

    // ----------------------------------------------------------
    // Execute Business Pipeline
    // ----------------------------------------------------------

    const business =
        await runProjectPipeline(project);

    if (!business.success)
        throw new Error("Business pipeline failed.");

    if (business.finalStatus !== "development_unlocked")
        throw new Error(
            `Expected development_unlocked, received ${business.finalStatus}`
        );

    console.log("✅ Business Pipeline");

    // ----------------------------------------------------------
    // Build Requirement Report
    // ----------------------------------------------------------

    const requirementReport = {

        report: {

            projectId:
                business.project.projectId,

            businessGoal:
                business.project.requirements.businessGoal,

            summary:
                business.project.solution

        }

    };

    // ----------------------------------------------------------
    // Execute Engineering Pipeline
    // ----------------------------------------------------------

    const engineering =
        await runEngineeringPipeline(
            requirementReport
        );

    if (!engineering.success)
        throw new Error("Engineering pipeline failed.");

    if (!engineering.recommendation)
        throw new Error("Recommendation missing.");

    if (!engineering.decision)
        throw new Error("Decision missing.");

    if (!engineering.plan)
        throw new Error("Engineering plan missing.");

    console.log("✅ Engineering Pipeline");

    // ----------------------------------------------------------
    // Combined Lifecycle Result
    // ----------------------------------------------------------

    const lifecycle = {

        success: true,

        business,

        engineering

    };

    console.log("\n══════════════════════════════════════");
    console.log(" AUTONOMOUS PROJECT LIFECYCLE");
    console.log("══════════════════════════════════════");

    console.log("Project ID:",
        lifecycle.business.project.projectId);

    console.log("Business Status:",
        lifecycle.business.finalStatus);

    console.log("Recommendation:",
        lifecycle.engineering.recommendation.recommendationId);

    console.log("Decision:",
        lifecycle.engineering.decision.decisionId);

    console.log("Plan:",
        lifecycle.engineering.plan.planId);

    console.log("\n🎉 AUTONOMOUS PROJECT LIFECYCLE PASSED\n");

}
catch (error) {

    console.error("\n❌ AUTONOMOUS PROJECT LIFECYCLE FAILED\n");

    console.error(error);

    process.exit(1);

}