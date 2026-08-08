import assert from "assert";

import MemoryEvents, {
    MemoryEventType
} from "./lib/engineering-memory/memory-events.js";

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
console.log(" MEMORY EVENTS TEST");
console.log("══════════════════════════════════════");
console.log("");

const events = new MemoryEvents();

let fired = false;

events.on(

    MemoryEventType.CREATED,

    payload => {

        fired = payload.id === "MEM-001";

    }

);

test("created event", () => {

    events.emit(

        MemoryEventType.CREATED,

        {

            id: "MEM-001"

        }

    );

    assert.equal(fired, true);

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" MEMORY EVENTS RESULT");
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