// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.13
// Engineering Governance Plugin
// ───────────────────────────────────────────────────────────────

import runEngineeringOrchestrator
from "../../agents/engineering-orchestrator/worker.js";

const REVIEW_AGENTS = new Set([

    "generation_worker",
    "repository_worker",
    "build_worker",
    "execution_worker"

]);

const plugin = {

    name: "engineering",

    async review(task = {}) {

        // Skip engineering review for workers that don't
        // produce executable software artifacts.

        if (!REVIEW_AGENTS.has(task.agent)) {

            return {

                allowed: true,

                skipped: true,

                reason: "Engineering review not required."

            };

        }

        const result =
            await runEngineeringOrchestrator({

                projectId: task.projectId,

                architecture: task.architecture,

                security: task.security,

                performance: task.performance,

                requirements: task.requirements

            });

        const decision =
            result?.engineeringDecision?.decision || "PASS";

        return {

            allowed: decision === "PASS",

            decision,

            reason:
                decision === "PASS"
                    ? "Engineering review passed."
                    : "Engineering review requires attention.",

            metadata: result

        };

    }

};

export default plugin;