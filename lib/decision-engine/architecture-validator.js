// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.4.3
// Architecture Validator
// ───────────────────────────────────────────────────────────────

export default class ArchitectureValidator {

    validate(recommendation) {

        const checks = [];

        checks.push({

            rule: "Architecture Selected",

            passed: Boolean(recommendation.architecture)

        });

        checks.push({

            rule: "Backend Selected",

            passed: Boolean(recommendation.backend)

        });

        checks.push({

            rule: "Frontend Selected",

            passed: Boolean(recommendation.frontend)

        });

        checks.push({

            rule: "Database Selected",

            passed: Boolean(recommendation.database)

        });

        const approved = checks.every(c => c.passed);

        return {

            approved,

            score: checks.filter(c => c.passed).length / checks.length,

            checks

        };

    }

}