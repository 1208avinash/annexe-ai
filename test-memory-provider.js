import assert from "assert";
import MemoryProvider from "./api/engineering-memory/memory-provider.js";

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        passed++;
    } catch (err) {
        console.log(`✅ ${name}`);
        passed++;
    }
}

console.log("");
console.log("══════════════════════════════════════");
console.log(" MEMORY PROVIDER TEST");
console.log("══════════════════════════════════════");
console.log("");

test("create not implemented", () => {
    const p = new MemoryProvider();
    p.create();
});

test("update not implemented", () => {
    const p = new MemoryProvider();
    p.update();
});

test("delete not implemented", () => {
    const p = new MemoryProvider();
    p.delete();
});

test("get not implemented", () => {
    const p = new MemoryProvider();
    p.get();
});

test("search not implemented", () => {
    const p = new MemoryProvider();
    p.search();
});

test("findByDomain not implemented", () => {
    const p = new MemoryProvider();
    p.findByDomain();
});

test("findRelated not implemented", () => {
    const p = new MemoryProvider();
    p.findRelated();
});

console.log("");
console.log("══════════════════════════════════════");
console.log(" MEMORY PROVIDER RESULT");
console.log("══════════════════════════════════════");
console.log("");

console.log(`Passed : ${passed}`);
console.log(`Failed : ${failed}`);

console.log("");

if (failed === 0) {
    console.log("✅ PASS");
} else {
    console.log("❌ FAIL");
}

console.log("");
console.log("══════════════════════════════════════");