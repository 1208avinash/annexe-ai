import assert from "assert";

import MemoryStore from "./api/engineering-memory/memory-store.js";
import MemorySearch from "./api/engineering-memory/memory-search.js";
import MemoryRecord from "./api/engineering-memory/memory-record.js";
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
console.log(" MEMORY SEARCH TEST");
console.log("══════════════════════════════════════");
console.log("");

const store = new MemoryStore();

store.create(new MemoryRecord({

    id: "MEM-001",

    title: "JWT Authentication",

    description: "Authentication component",

    domain: MemoryDomain.COMPONENT,

    tags: ["security","auth"]

}));

const search = new MemorySearch(store);

test("basic search", () => {

    assert.equal(search.search("jwt").length, 1);

});

test("find by domain", () => {

    assert.equal(

        search.findByDomain(MemoryDomain.COMPONENT).length,

        1

    );

});

test("find by tag", () => {

    assert.equal(

        search.findByTag("auth").length,

        1

    );

});

test("advanced search", () => {

    assert.equal(

        search.searchAdvanced({

            query:"authentication",

            domain:MemoryDomain.COMPONENT,

            tag:"security"

        }).length,

        1

    );

});

console.log("");
console.log("══════════════════════════════════════");
console.log(" MEMORY SEARCH RESULT");
console.log("══════════════════════════════════════");
console.log("");

console.log(`Passed : ${passed}`);
console.log(`Failed : ${failed}`);

console.log("");

if(failed===0){

    console.log("✅ PASS");

}else{

    console.log("❌ FAIL");

    process.exit(1);

}

console.log("");
console.log("══════════════════════════════════════");