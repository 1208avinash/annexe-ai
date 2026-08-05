// ───────────────────────────────────────────────────────────────
// ANNEXE AI V7
// RC-7.0.0
// Engineering Contract Validation Test
// ───────────────────────────────────────────────────────────────

import EngineeringBrain from "./api/engineering-brain/runner.js";
import DecisionEngine from "./api/decision-engine/decision-engine.js";
import PlanningEngine from "./api/planning-engine/planning-engine.js";

console.log("\n═══════════════════════════════════════════════");
console.log(" ANNEXE AI — Engineering Contract Validation");
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

    // ---------------------------------------------------------
    // Engineering Brain
    // ---------------------------------------------------------

    const brain = new EngineeringBrain();

    const brainResult =
        brain.run(requirementReport);

    console.log("✅ Engineering Brain");

    // ---------------------------------------------------------
    // Recommendation Contract
    // ---------------------------------------------------------

    if (!brainResult.recommendation)
        throw new Error("Recommendation missing");

    if (!brainResult.recommendation.recommendationId)
        throw new Error("recommendationId missing");

    console.log("✅ Recommendation Contract");

    // ---------------------------------------------------------
    // Decision Engine
    // ---------------------------------------------------------

    const decisionEngine =
        new DecisionEngine();

    const decision =
        decisionEngine.decide(
            brainResult.recommendation
        );

    console.log("\nDecision Output:");
console.dir(decision, { depth: null });

    if (!decision)
        throw new Error("Decision missing");

    if (!decision.decisionId)
        throw new Error("decisionId missing");

    console.log("✅ Decision Contract");

    // ---------------------------------------------------------
    // Planning Engine
    // ---------------------------------------------------------

    const planner =
        new PlanningEngine();

    const plan =
        planner.createPlan(decision);

    if (!plan)
        throw new Error("Plan missing");

    if (!plan.planId)
        throw new Error("planId missing");

    console.log("✅ Planning Contract");

    // ---------------------------------------------------------
    // Summary
    // ---------------------------------------------------------

    console.log("\n══════════════════════════════════════");

    console.log("Engineering Brain   ✔");
    console.log("Decision Engine     ✔");
    console.log("Planning Engine     ✔");

    console.log("══════════════════════════════════════");

    console.log("\n🎉 ALL CONTRACTS VERIFIED\n");

}
catch (error) {

    console.error("\n❌ CONTRACT TEST FAILED\n");

    console.error(error);

    process.exit(1);

}