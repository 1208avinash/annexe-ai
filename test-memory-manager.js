import assert from "assert";

import MemoryManager from "./api/engineering-memory/memory-manager.js";

import { MemoryDomain } from "./api/engineering-memory/memory-types.js";

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
console.log(" MEMORY MANAGER TEST");
console.log("══════════════════════════════════════");
console.log("");

const manager = new MemoryManager();

let recordId = "";

test("create memory", () => {

    const record = manager.createMemory({

        title: "JWT Authentication",

        description: "Reusable authentication pattern.",

        domain: MemoryDomain.COMPONENT

    });

    recordId = record.id;

    assert.ok(record.id);

});

test("get memory", () => {

    const record = manager.getMemory(recordId);

    assert.equal(record.title, "JWT Authentication");

});

test("update memory", () => {

    manager.updateMemory(recordId, {

        title: "OAuth Authentication"

    });

    const updated = manager.getMemory(recordId);

    assert.equal(updated.title, "OAuth Authentication");

});

test("search memory", () => {

    const results = manager.searchMemory("oauth");

    assert.equal(results.length, 1);

});

test("find by domain", () => {

    const results = manager.findByDomain(MemoryDomain.COMPONENT);

    assert.equal(results.length, 1);

});

test("delete memory", () => {

    manager.deleteMemory(recordId);

    assert.equal(manager.getMemory(recordId), null);

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" MEMORY MANAGER RESULT");
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