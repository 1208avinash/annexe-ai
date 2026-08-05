// ───────────────────────────────────────────────────────────────
// ANNEXE AI V7
// RC-7.0.1
// Engineering Pipeline
// Public Engineering Execution API
// ───────────────────────────────────────────────────────────────

import EngineeringBrain from "../engineering-brain/runner.js";
import DecisionEngine from "../decision-engine/decision-engine.js";
import PlanningEngine from "../planning-engine/planning-engine.js";

export async function runEngineeringPipeline(requirementReport = {}) {

    const brain = new EngineeringBrain();

    const decisionEngine = new DecisionEngine();

    const planningEngine = new PlanningEngine();

    // ----------------------------------------------------------
    // Engineering Brain
    // ----------------------------------------------------------

    const engineering =
        brain.run(requirementReport);

    // ----------------------------------------------------------
    // Decision
    // ----------------------------------------------------------

    const decision =
        decisionEngine.decide(
            engineering.recommendation
        );

    // ----------------------------------------------------------
    // Planning
    // ----------------------------------------------------------

    const plan =
        planningEngine.createPlan(
            decision
        );

    // ----------------------------------------------------------
    // Result
    // ----------------------------------------------------------

    return {

        success: true,

        requirement:
            engineering.requirement,

        knowledge:
            engineering.knowledge,

        evidence:
            engineering.evidence,

        recommendation:
            engineering.recommendation,

        confidence:
            engineering.confidence,

        decision,

        plan

    };

}

export default {

    runEngineeringPipeline

};