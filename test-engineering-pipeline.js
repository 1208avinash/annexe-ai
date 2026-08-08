// ───────────────────────────────────────────────────────────────
// ANNEXE AI V7
// RC-7.0.2
// Engineering Pipeline Integration Test
// ───────────────────────────────────────────────────────────────

import { runEngineeringPipeline }
    from "./lib/orchestrator/engineering-pipeline.js";

console.log("\n═══════════════════════════════════════════════");
console.log(" ANNEXE AI — Engineering Pipeline Test");
console.log("═══════════════════════════════════════════════\n");

try {

    const requirementReport = {

        report: {

            projectId: "PROJECT-001",

            businessGoal:
                "Build a CRM platform for healthcare clinics",

            summary:
                "Healthcare CRM"

        }

    };

    const result =
        await runEngineeringPipeline(
            requirementReport
        );

    if (!result.success)
        throw new Error("Pipeline failed");

    if (!result.recommendation)
        throw new Error("Recommendation missing");

    if (!result.decision)
        throw new Error("Decision missing");

    if (!result.plan)
        throw new Error("Engineering plan missing");

    if (!result.decision.decisionId)
        throw new Error("Decision contract invalid");

    if (!result.plan.planId)
        throw new Error("Plan contract invalid");

    console.log("✅ Engineering Brain");
    console.log("✅ Decision Engine");
    console.log("✅ Planning Engine");
    console.log("✅ Engineering Pipeline");

    console.log("\n══════════════════════════════════════");
    console.log("ENGINEERING PIPELINE VERIFIED");
    console.log("══════════════════════════════════════");

    console.log("\nRecommendation ID:",
        result.recommendation.recommendationId);

    console.log("Decision ID:",
        result.decision.decisionId);

    console.log("Plan ID:",
        result.plan.planId);

    console.log("\n🎉 ENGINEERING PIPELINE PASSED\n");

}
catch (error) {

    console.error("\n❌ ENGINEERING PIPELINE FAILED\n");

    console.error(error);

    process.exit(1);

}