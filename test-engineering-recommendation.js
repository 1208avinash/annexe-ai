import assert from "assert";

import EngineeringRecommendation from "./lib/engineering-brain/contracts/engineering-recommendation.js";

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
console.log(" ENGINEERING RECOMMENDATION TEST");
console.log("══════════════════════════════════════");
console.log("");

test("creates recommendation", () => {

    const rec = new EngineeringRecommendation({

        projectId: "CRM-001",

        architecture: "Multi-tenant SaaS",

        backend: "Node.js",

        frontend: "React",

        database: "PostgreSQL",

        confidence: 0.94

    });

    assert.equal(rec.projectId, "CRM-001");

    assert.equal(rec.backend, "Node.js");

    assert.equal(rec.frontend, "React");

    assert.equal(rec.database, "PostgreSQL");

});

test("toJSON works", () => {

    const rec = new EngineeringRecommendation();

    assert.ok(rec.toJSON());

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" ENGINEERING RECOMMENDATION RESULT");
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