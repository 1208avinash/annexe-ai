// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.12
// Governance Framework Test
// ───────────────────────────────────────────────────────────────

import GovernanceFramework from "./api/orchestrator/governance.js";

let passed = 0;
let failed = 0;

function assert(name, condition, actual = null) {

    if (condition) {

        console.log(`✅ ${name}`);
        passed++;

    } else {

        console.log(`❌ ${name}`);

        if (actual !== null)
            console.log(actual);

        failed++;

    }

}

async function main() {

    console.log("");
    console.log("══════════════════════════════════════");
    console.log(" GOVERNANCE FRAMEWORK TEST");
    console.log("══════════════════════════════════════");
    console.log("");

    const governance = new GovernanceFramework();

    governance.register({

        name: "engineering",

        async review(task) {

            return {

                allowed: true,

                reason: "Engineering review passed.",

                metadata: {

                    projectId: task.projectId

                }

            };

        }

    });

    const result = await governance.review({

        projectId: "PROJECT-RC5-012",

        agent: "generation_worker"

    });

    assert(
        "review executed",
        result !== null,
        result
    );

    assert(
        "allowed",
        result.allowed === true,
        result
    );

    assert(
        "reports returned",
        Array.isArray(result.reports),
        result
    );

    assert(
        "plugin executed",
        result.reports.length === 1,
        result
    );

    assert(
        "plugin name",
        result.reports[0].plugin === "engineering",
        result
    );

    console.log("");

    console.log("══════════════════════════════════════");
    console.log(" GOVERNANCE FRAMEWORK RESULT");
    console.log("══════════════════════════════════════");
    console.log("");

    console.log(`Passed : ${passed}`);
    console.log(`Failed : ${failed}`);
    console.log("");

    if (failed === 0) {

        console.log("✅ PASS");
        console.log("");
        console.log("Governance Framework verified.");
        console.log("");

    } else {

        console.log("❌ FAIL");
        console.log("");

    }

    console.log("══════════════════════════════════════");

}

main();