import assert from "assert";

import RiskAnalyzer from "./lib/decision-engine/risk-analyzer.js";

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
console.log(" RISK ANALYZER TEST");
console.log("══════════════════════════════════════");
console.log("");

const analyzer = new RiskAnalyzer();

test("low risk recommendation", () => {

    const result = analyzer.analyze({

        architecture: "Multi-tenant SaaS",

        backend: "Node.js",

        frontend: "React",

        database: "PostgreSQL"

    });

    assert.equal(result.riskScore, 0);

    assert.equal(result.approved, true);

});

test("high risk recommendation", () => {

    const result = analyzer.analyze({

        architecture: "",

        backend: "",

        frontend: "",

        database: ""

    });

    assert.equal(result.riskScore, 1);

    assert.equal(result.approved, false);

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" RISK ANALYZER RESULT");
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