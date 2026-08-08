import assert from "assert";

import KnowledgeEngine from "./lib/engineering-brain/knowledge-engine.js";

import {
    MemoryManager,
    MemoryDomain
} from "./lib/engineering-memory/index.js";

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
console.log(" KNOWLEDGE ENGINE TEST");
console.log("══════════════════════════════════════");
console.log("");

const manager = new MemoryManager();

manager.createMemory({

    title: "JWT Authentication",

    description: "Reusable authentication module.",

    domain: MemoryDomain.COMPONENT

});

const engine = new KnowledgeEngine(manager);

test("retrieve knowledge", () => {

    const result = engine.retrieveKnowledge("jwt");

    assert.equal(result.total, 1);

});

test("find by domain", () => {

    const result = engine.findByDomain(

        MemoryDomain.COMPONENT

    );

    assert.equal(result.length, 1);

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" KNOWLEDGE ENGINE RESULT");
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