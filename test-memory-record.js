import assert from "assert";
import MemoryRecord from "./api/engineering-memory/memory-record.js";
import { MemoryDomain } from "./api/engineering-memory/memory-types.js";

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        passed++;
    } catch (err) {
        console.log(`❌ ${name}`);
        console.error(err.message);
        failed++;
    }
}

console.log("");
console.log("══════════════════════════════════════");
console.log(" MEMORY RECORD TEST");
console.log("══════════════════════════════════════");
console.log("");

test("default record validates", () => {
    const r = new MemoryRecord({
        title: "Authentication Pattern"
    });

    assert.equal(r.validate(), true);
});

test("domain stored", () => {
    const r = new MemoryRecord({
        title: "JWT",
        domain: MemoryDomain.COMPONENT
    });

    assert.equal(r.domain, MemoryDomain.COMPONENT);
});

test("toJSON works", () => {
    const r = new MemoryRecord({
        title: "Pattern"
    });

    assert.ok(r.toJSON().title === "Pattern");
});

test("empty title fails validation", () => {
    const r = new MemoryRecord();

    assert.equal(r.validate(), false);
});

console.log("");
console.log("══════════════════════════════════════");
console.log(" MEMORY RECORD RESULT");
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