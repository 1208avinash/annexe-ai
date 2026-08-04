// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.4.4
// Risk Analyzer
// ───────────────────────────────────────────────────────────────

export default class RiskAnalyzer {

    analyze(recommendation) {

        const risks = [];

        if (!recommendation.architecture) {

            risks.push("Architecture not defined");

        }

        if (!recommendation.backend) {

            risks.push("Backend not selected");

        }

        if (!recommendation.frontend) {

            risks.push("Frontend not selected");

        }

        if (!recommendation.database) {

            risks.push("Database not selected");

        }

        const riskScore = Math.min(risks.length / 4, 1);

        return {

            approved: riskScore < 0.5,

            riskScore,

            risks

        };

    }

}