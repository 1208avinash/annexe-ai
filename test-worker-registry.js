import assert from "assert";
import WorkerRegistry from "./lib/execution-orchestrator/worker-registry.js";

const registry = new WorkerRegistry();

registry.register("generation", {
    execute: () => ({ success: true })
});

assert.equal(registry.has("generation"), true);

assert.ok(registry.get("generation"));

assert.equal(registry.list().length, 1);

console.log("");
console.log("══════════════════════════════");
console.log(" WORKER REGISTRY TEST");
console.log("══════════════════════════════");
console.log("✅ PASS");
console.log("");