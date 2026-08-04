// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.4.5
// Decision Engine
// ───────────────────────────────────────────────────────────────

import EngineeringDecision from "./contracts/engineering-decision.js";
import GovernanceValidator from "./governance-validator.js";
import ArchitectureValidator from "./architecture-validator.js";
import RiskAnalyzer from "./risk-analyzer.js";

export default class DecisionEngine {

    constructor() {

        this.governance = new GovernanceValidator();

        this.architecture = new ArchitectureValidator();

        this.risk = new RiskAnalyzer();

    }

    decide(recommendation) {

        const governanceResult =
            this.governance.validate(recommendation);

        const architectureResult =
            this.architecture.validate(recommendation);

        const riskResult =
            this.risk.analyze(recommendation);

        const approved =

            governanceResult.approved &&

            architectureResult.approved &&

            riskResult.approved;

        return new EngineeringDecision({

            recommendationId:
                recommendation.recommendationId,

            projectId:
                recommendation.projectId,

            approved,

            approvalReason:

                approved
                    ? "Recommendation satisfies engineering standards."
                    : "Recommendation requires review.",

            governanceChecks:
                governanceResult.checks,

            architectureChecks:
                architectureResult.checks,

            riskScore:
                riskResult.riskScore,

            decisionConfidence:
                recommendation.confidence

        });

    }

}