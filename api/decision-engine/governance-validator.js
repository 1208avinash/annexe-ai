// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.4.2
// Governance Validator
// ───────────────────────────────────────────────────────────────

export default class GovernanceValidator {

    validate(recommendation) {

        const checks = [];

        if (recommendation.architecture) {

            checks.push({
                rule: "Architecture Defined",
                passed: true
            });

        } else {

            checks.push({
                rule: "Architecture Defined",
                passed: false
            });

        }

        if (recommendation.backend) {

            checks.push({
                rule: "Backend Defined",
                passed: true
            });

        } else {

            checks.push({
                rule: "Backend Defined",
                passed: false
            });

        }

        if (recommendation.frontend) {

            checks.push({
                rule: "Frontend Defined",
                passed: true
            });

        } else {

            checks.push({
                rule: "Frontend Defined",
                passed: false
            });

        }

        const approved = checks.every(c => c.passed);

        return {

            approved,

            checks

        };

    }

}