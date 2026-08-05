// ───────────────────────────────────────────────────────────────
// ANNEXE AI V7
// RC-7.1.4
// Business Pipeline Integration Test
// ───────────────────────────────────────────────────────────────

import { createProjectSchema } from "./api/projects/schema.js";
import { runProjectPipeline } from "./api/orchestrator/pipeline.js";

console.log("\n═══════════════════════════════════════════════");
console.log(" ANNEXE AI — Business Pipeline Test");
console.log("═══════════════════════════════════════════════\n");

try {

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
    // Execute Business Pipeline
    // ----------------------------------------------------------

    const result =
        await runProjectPipeline(project);

    console.log("\n══════════════════════════════════════");
    console.log(" Business Pipeline Output");
    console.log("══════════════════════════════════════\n");

    console.dir(result, { depth: null });

    if (!result.success)
        throw new Error("Business pipeline failed.");

    if (!result.project)
        throw new Error("Project missing.");

    if (!result.pipelineStatus)
        throw new Error("Pipeline status missing.");

    if (!result.finalStatus)
        throw new Error("Final status missing.");

    console.log("\n══════════════════════════════════════");
    console.log(" Business Pipeline Verification");
    console.log("══════════════════════════════════════");

    console.log("Project ID:",
        result.project.projectId);

    console.log("Final Status:",
        result.finalStatus);

    console.log("Pipeline Status:");
    console.dir(result.pipelineStatus, { depth: null });

    console.log("\n✅ Business Pipeline PASSED\n");

}
catch (error) {

    console.error("\n❌ Business Pipeline FAILED\n");

    console.error(error);

    process.exit(1);

}