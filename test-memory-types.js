import assert from "assert";
import {
    MemoryDomain,
    MemoryCategory,
    isValidMemoryDomain,
    isValidMemoryCategory
} from "./lib/engineering-memory/memory-types.js";

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
console.log(" MEMORY TYPES TEST");
console.log("══════════════════════════════════════");
console.log("");

test("knowledge domain exists", () => {

    assert.equal(
        MemoryDomain.KNOWLEDGE,
        "knowledge"
    );

});

test("pattern domain exists", () => {

    assert.equal(
        MemoryDomain.PATTERN,
        "pattern"
    );

});

test("backend category exists", () => {

    assert.equal(
        MemoryCategory.BACKEND,
        "backend"
    );

});

test("valid domain", () => {

    assert.equal(
        isValidMemoryDomain("knowledge"),
        true
    );

});

test("invalid domain", () => {

    assert.equal(
        isValidMemoryDomain("banana"),
        false
    );

});

test("valid category", () => {

    assert.equal(
        isValidMemoryCategory("security"),
        true
    );

});

test("invalid category", () => {

    assert.equal(
        isValidMemoryCategory("pizza"),
        false
    );

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" MEMORY TYPES RESULT");
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