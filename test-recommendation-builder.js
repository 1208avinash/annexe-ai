import assert from "assert";

import RecommendationBuilder
from "./lib/engineering-brain/recommendation-builder.js";

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
console.log(" RECOMMENDATION BUILDER TEST");
console.log("══════════════════════════════════════");
console.log("");

const builder = new RecommendationBuilder();

const requirement = {

    projectId:"CRM-001",

    summary:"Build CRM"

};

const knowledgePackage = {

    records:[

        {

            title:"Authentication",

            domain:"component"

        },

        {

            title:"CRM Pattern",

            domain:"pattern"

        }

    ]

};

const evidencePackage = {

    evidence:[

        {

            title:"Authentication"

        }

    ],

    averageConfidence:0.95

};

test("build recommendation",()=>{

    const rec = builder.build(

        requirement,

        knowledgePackage,

        evidencePackage

    );

    assert.equal(

        rec.backend,

        "Node.js"

    );

    assert.equal(

        rec.frontend,

        "React"

    );

    assert.equal(

        rec.database,

        "PostgreSQL"

    );

    assert.equal(

        rec.confidence,

        0.95

    );

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" RECOMMENDATION BUILDER RESULT");
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