import assert from "assert";

import ConfidenceEngine
from "./api/engineering-brain/confidence-engine.js";

let passed = 0;
let failed = 0;

function test(name, fn){

    try{

        fn();

        console.log(`✅ ${name}`);

        passed++;

    }

    catch(err){

        console.log(`❌ ${name}`);

        console.error(err.message);

        failed++;

    }

}

console.log("");
console.log("══════════════════════════════════════");
console.log(" CONFIDENCE ENGINE TEST");
console.log("══════════════════════════════════════");
console.log("");

const engine = new ConfidenceEngine();

const recommendation = {

    architecture:"Multi-tenant SaaS",

    backend:"Node.js",

    frontend:"React",

    database:"PostgreSQL",

    engineeringPatterns:[

        "crm",

        "authentication"

    ]

};

const evidencePackage = {

    total:4,

    averageConfidence:0.95

};

test("calculate confidence",()=>{

    const result = engine.evaluate(

        recommendation,

        evidencePackage

    );

    assert.ok(

        result.confidence > 0

    );

    assert.ok(

        result.breakdown

    );

    assert.ok(

        result.explanation.length>0

    );

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" CONFIDENCE ENGINE RESULT");
console.log("══════════════════════════════════════");
console.log("");

console.log(`Passed : ${passed}`);

console.log(`Failed : ${failed}`);

console.log("");

if(failed===0){

    console.log("✅ PASS");

}

else{

    console.log("❌ FAIL");

    process.exit(1);

}

console.log("");
console.log("══════════════════════════════════════");