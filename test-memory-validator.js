import assert from "assert";
import MemoryRecord from "./lib/engineering-memory/memory-record.js";
import { validateMemoryRecord } from "./lib/engineering-memory/memory-validator.js";

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
console.log(" MEMORY VALIDATOR TEST");
console.log("══════════════════════════════════════");
console.log("");

test("valid record", () => {

    const record = new MemoryRecord({
        title: "JWT Authentication"
    });

    const result = validateMemoryRecord(record);

    assert.equal(result.valid, true);

});

test("missing title", () => {

    const record = new MemoryRecord();

    const result = validateMemoryRecord(record);

    assert.equal(result.valid, false);

});

test("invalid confidence", () => {

    const record = new MemoryRecord({
        title: "Pattern",
        confidence: 2
    });

    const result = validateMemoryRecord(record);

    assert.equal(result.valid, false);

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" MEMORY VALIDATOR RESULT");
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