// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.4.3
// Engineering Brain Runner Test
// ───────────────────────────────────────────────────────────────

import EngineeringBrain from "./lib/engineering-brain/runner.js";

console.log("\n═══════════════════════════════════════════════");
console.log("  ANNEXE AI — Engineering Brain Runner Test");
console.log("═══════════════════════════════════════════════\n");

const brain = new EngineeringBrain();

const requirementReport = {
    report: {
        projectId: "PROJECT-001",
        businessGoal: "Build a CRM platform for healthcare clinics",
        summary: "Healthcare CRM"
    }
};

try {

    const result = brain.run(requirementReport);

    console.log("SUCCESS:", result.success);
    console.log("Knowledge Records:", result.knowledge.total);
    console.log("Evidence:", result.evidence.total);
    console.log("Recommendation ID:", result.recommendation.recommendationId);
    console.log("Confidence:", result.confidence.confidence);

    console.log("\n✅ Engineering Brain Runner PASSED\n");

} catch (error) {

    console.error("\n❌ Engineering Brain Runner FAILED\n");
    console.error(error);

    process.exit(1);

}