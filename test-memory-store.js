import assert from "assert";

import MemoryStore from "./lib/engineering-memory/memory-store.js";

import MemoryRecord from "./lib/engineering-memory/memory-record.js";

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

        console.error(err);

        failed++;

    }

}

console.log("");
console.log("══════════════════════════════════════");
console.log(" MEMORY STORE TEST");
console.log("══════════════════════════════════════");
console.log("");

const store = new MemoryStore();

test("create record", () => {

    const record = new MemoryRecord({

        id: "REC-001",

        title: "JWT Authentication"

    });

    store.create(record);

    assert.equal(

        store.getById("REC-001").title,

        "JWT Authentication"

    );

});

test("update record", () => {

    store.update("REC-001", {

        title: "OAuth Authentication"

    });

    assert.equal(

        store.getById("REC-001").title,

        "OAuth Authentication"

    );

});

test("search", () => {

    const results = store.search("oauth");

    assert.equal(results.length, 1);

});

test("delete", () => {

    store.delete("REC-001");

    assert.equal(

        store.getById("REC-001"),

        null

    );

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" MEMORY STORE RESULT");
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