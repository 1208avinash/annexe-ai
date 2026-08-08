// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.11
// Engineering Orchestrator
// ───────────────────────────────────────────────────────────────

import { run as runRiskWorker }
from "../risk/worker.js";

import { run as runDependencyWorker }
from "../dependency/worker.js";

import { run as runArchitectureValidatorWorker }
from "../architecture-validator/worker.js";

import { run as runSecurityWorker }
from "../security/worker.js";

import { run as runPerformanceWorker }
from "../performance/worker.js";

import { run as runEngineeringIntelligenceWorker }
from "../engineering-intelligence/worker.js";

const AGENT_ID = "engineering_orchestrator_worker";
const VERSION = "1.0.0";

export async function run(input = {}) {

    const { projectId } = input;

    if (!projectId) {

        return {

            success: false,

            agent: AGENT_ID,

            error: "projectId is required."

        };

    }

    const reports = [];

    reports.push(await runRiskWorker(input));

    reports.push(await runDependencyWorker(input));

    reports.push(await runArchitectureValidatorWorker(input));

    reports.push(await runSecurityWorker(input));

    reports.push(await runPerformanceWorker(input));

    const engineeringDecision =
        await runEngineeringIntelligenceWorker({

            projectId,

            reports

        });

    return {

        success: true,

        agent: AGENT_ID,

        version: VERSION,

        projectId,

        reports,

        engineeringDecision,

        _meta: {

            generatedAt: new Date().toISOString(),

            rc: "RC-5.11"

        }

    };

}

export default run;