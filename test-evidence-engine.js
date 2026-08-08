import assert from "assert";

import EvidenceEngine from "./lib/engineering-brain/evidence-engine.js";

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
console.log(" EVIDENCE ENGINE TEST");
console.log("══════════════════════════════════════");
console.log("");

const engine = new EvidenceEngine();

const knowledgePackage = {

    query: "crm",

    records: [

        {
            id: "MEM-001",
            title: "CRM Pattern",
            domain: "pattern",
            confidence: 0.9
        },

        {
            id: "MEM-002",
            title: "JWT Authentication",
            domain: "component",
            confidence: 1.0
        }

    ]

};

test("build evidence package", () => {

    const result = engine.build(knowledgePackage);

    assert.equal(result.total, 2);

    assert.ok(result.averageConfidence > 0);

    assert.equal(result.evidence.length, 2);

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" EVIDENCE ENGINE RESULT");
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