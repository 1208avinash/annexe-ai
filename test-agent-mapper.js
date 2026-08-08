// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-5.13
// Agent Mapper Test
// ───────────────────────────────────────────────────────────────

import AgentMapper, {
    getAgentRoute
} from "./lib/orchestrator/agent-mapper.js";

let passed = 0;
let failed = 0;

function assert(name, condition, actual = null) {

    if (condition) {

        console.log(`✅ ${name}`);
        passed++;

    } else {

        console.log(`❌ ${name}`);

        if (actual !== null)
            console.log(actual);

        failed++;

    }

}

console.log("");
console.log("══════════════════════════════════════");
console.log(" AGENT MAPPER TEST");
console.log("══════════════════════════════════════");
console.log("");

const mapper = new AgentMapper();

assert(
    "mapper created",
    mapper instanceof AgentMapper
);

assert(
    "maps generation agent",
    mapper.mapAgent("generation_agent") === "generation_worker",
    mapper.mapAgent("generation_agent")
);

assert(
    "maps backend agent",
    mapper.mapAgent("backend_agent") === "backend_worker",
    mapper.mapAgent("backend_agent")
);

assert(
    "returns original worker",
    mapper.mapAgent("generation_worker") === "generation_worker",
    mapper.mapAgent("generation_worker")
);

assert(
    "route lookup",
    getAgentRoute("generation_worker") ===
    "/api/agents/generation/worker",
    getAgentRoute("generation_worker")
);

assert(
    "unknown route",
    getAgentRoute("unknown_worker") === null,
    getAgentRoute("unknown_worker")
);

console.log("");
console.log("══════════════════════════════════════");
console.log(" AGENT MAPPER RESULT");
console.log("══════════════════════════════════════");
console.log("");

console.log(`Passed : ${passed}`);
console.log(`Failed : ${failed}`);

console.log("");

if (failed === 0) {

    console.log("✅ PASS");
    console.log("");
    console.log("Agent Mapper verified.");
    console.log("");

} else {

    console.log("❌ FAIL");
    console.log("");

}

console.log("══════════════════════════════════════");