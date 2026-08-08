import assert from "assert";

import DecisionEngine from "./lib/decision-engine/decision-engine.js";

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
console.log(" DECISION ENGINE TEST");
console.log("══════════════════════════════════════");
console.log("");

const engine = new DecisionEngine();

test("approve recommendation", () => {

    const result = engine.decide({

        recommendationId: "REC-001",

        projectId: "CRM-001",

        architecture: "Multi-tenant SaaS",

        backend: "Node.js",

        frontend: "React",

        database: "PostgreSQL",

        engineeringPatterns: ["crm"],

        confidence: 0.94

    });

    assert.equal(result.approved, true);

    assert.equal(result.projectId, "CRM-001");

    assert.ok(result.decisionConfidence > 0);

});

test("reject recommendation", () => {

    const result = engine.decide({

        recommendationId: "REC-002",

        projectId: "CRM-002",

        architecture: "",

        backend: "",

        frontend: "",

        database: "",

        engineeringPatterns: [],

        confidence: 0.20

    });

    assert.equal(result.approved, false);

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" DECISION ENGINE RESULT");
console.log("══════════════════════════════════════");
console.log("");

console.log(`Passed : ${passed}`);
console.log(`Failed : ${failed}`);

console.log("");

if (failed === 0) {

    console.log("✅ PASS");

} else {

    console.log("❌ FAIL");

    process.exit(1);

}

console.log("");
console.log("══════════════════════════════════════");