import assert from "assert";

import GovernanceValidator from "./api/decision-engine/governance-validator.js";

let passed = 0;
let failed = 0;

function test(name, fn) {

    try {

        fn();

        console.log(`✅ ${name}`);

        passed++;

    }

    catch (err) {

        console.log(`❌ ${name}`);

        console.error(err.message);

        failed++;

    }

}

console.log("");
console.log("══════════════════════════════════════");
console.log(" GOVERNANCE VALIDATOR TEST");
console.log("══════════════════════════════════════");
console.log("");

const validator = new GovernanceValidator();

test("recommendation approved", () => {

    const result = validator.validate({

        architecture: "Multi-tenant SaaS",

        backend: "Node.js",

        frontend: "React"

    });

    assert.equal(result.approved, true);

    assert.equal(result.checks.length, 3);

});

test("recommendation rejected", () => {

    const result = validator.validate({

        architecture: "",

        backend: "",

        frontend: ""

    });

    assert.equal(result.approved, false);

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" GOVERNANCE VALIDATOR RESULT");
console.log("══════════════════════════════════════");
console.log("");

console.log(`Passed : ${passed}`);
console.log(`Failed : ${failed}`);

console.log("");

if (failed === 0) {

    console.log("✅ PASS");

}

else {

    console.log("❌ FAIL");

    process.exit(1);

}

console.log("");
console.log("══════════════════════════════════════");