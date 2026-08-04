import assert from "assert";

import ArchitectureValidator
from "./api/decision-engine/architecture-validator.js";

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
console.log(" ARCHITECTURE VALIDATOR TEST");
console.log("══════════════════════════════════════");
console.log("");

const validator = new ArchitectureValidator();

test("valid architecture", () => {

    const result = validator.validate({

        architecture: "Multi-tenant SaaS",

        backend: "Node.js",

        frontend: "React",

        database: "PostgreSQL"

    });

    assert.equal(result.approved, true);

    assert.equal(result.score, 1);

});

test("invalid architecture", () => {

    const result = validator.validate({

        architecture: "",

        backend: "",

        frontend: "",

        database: ""

    });

    assert.equal(result.approved, false);

    assert.ok(result.score < 1);

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" ARCHITECTURE VALIDATOR RESULT");
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