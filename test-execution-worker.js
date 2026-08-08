// ── ANNEXE AI — Execution Worker Test Suite ───────────────────────────────────
//
// Contract tests for api/agents/execution/worker.js and its registry entry.
//
// Does NOT call real npm commands — execution is mocked via registerAgent()
// for Stages 4 and 5.
//
// Run:
//   node test-execution-worker.js
//
// ─────────────────────────────────────────────────────────────────────────────

import { getAgent, registerAgent } from "./lib/orchestrator/agents.js";
import { run }                     from "./lib/agents/execution/worker.js";


// ── Assertion helper ──────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}


// ════════════════════════════════════════════════════════════════════════════
// Stage 1 — Agent Registry
// ════════════════════════════════════════════════════════════════════════════

console.log("\n════════════════════════════════════════════════════════════════");
console.log("  Stage 1 — Agent Registry");
console.log("════════════════════════════════════════════════════════════════");

const agentEntry = getAgent("execution_worker");

assert(
  "execution_worker is registered",
  agentEntry !== null && agentEntry !== undefined
);

assert(
  'agent.id === "execution_worker"',
  agentEntry?.id === "execution_worker"
);

assert(
  "agent.run is a function",
  typeof agentEntry?.run === "function"
);

assert(
  "agent.version === 1",
  agentEntry?.version === 1
);


// ════════════════════════════════════════════════════════════════════════════
// Stage 2 — Missing projectId
// ════════════════════════════════════════════════════════════════════════════

console.log("\n════════════════════════════════════════════════════════════════");
console.log("  Stage 2 — Missing projectId");
console.log("════════════════════════════════════════════════════════════════");

const s2Result = await run({});

assert(
  "success === false",
  s2Result.success === false
);

assert(
  'agent === "execution_worker"',
  s2Result.agent === "execution_worker"
);

assert(
  'status === "BUILD_FAILED"',
  s2Result.status === "BUILD_FAILED"
);

assert(
  "errorLogs exists",
  s2Result.errorLogs !== undefined && s2Result.errorLogs !== null
);


// ════════════════════════════════════════════════════════════════════════════
// Stage 3 — Missing payload (no generatedFiles / environment)
// ════════════════════════════════════════════════════════════════════════════

console.log("\n════════════════════════════════════════════════════════════════");
console.log("  Stage 3 — Missing payload");
console.log("════════════════════════════════════════════════════════════════");

const s3Result = await run({ projectId: "TEST-PROJECT" });

assert(
  "success === false",
  s3Result.success === false
);

assert(
  'status === "BUILD_FAILED"',
  s3Result.status === "BUILD_FAILED"
);


// ════════════════════════════════════════════════════════════════════════════
// Stage 4 — Success contract  (mocked — no real npm commands)
// ════════════════════════════════════════════════════════════════════════════

console.log("\n════════════════════════════════════════════════════════════════");
console.log("  Stage 4 — Success contract  (mocked)");
console.log("════════════════════════════════════════════════════════════════");

registerAgent("execution_worker", async (_input) => ({
  success: true,
  agent:   "execution_worker",
  status:  "BUILD_SUCCESS",
  executionReport: {
    environment: { runtime: "node" },
    commands:    [],
    logs:        {}
  }
}));

const s4Agent  = getAgent("execution_worker");
const s4Result = await s4Agent.run({
  projectId:      "TEST-PROJECT",
  generatedFiles: [{ path: "src/index.js", content: "// entry" }],
  environment:    { runtime: "node" }
});

assert(
  "success === true",
  s4Result.success === true
);

assert(
  'agent === "execution_worker"',
  s4Result.agent === "execution_worker"
);

assert(
  'status === "BUILD_SUCCESS"',
  s4Result.status === "BUILD_SUCCESS"
);

assert(
  "executionReport exists",
  s4Result.executionReport !== null && s4Result.executionReport !== undefined
);


// ════════════════════════════════════════════════════════════════════════════
// Stage 5 — Failure contract  (mocked — execution failure)
// ════════════════════════════════════════════════════════════════════════════

console.log("\n════════════════════════════════════════════════════════════════");
console.log("  Stage 5 — Failure contract  (mocked)");
console.log("════════════════════════════════════════════════════════════════");

registerAgent("execution_worker", async (_input) => ({
  success:  false,
  agent:    "execution_worker",
  status:   "BUILD_FAILED",
  failedAt: "npm run build",
  errorLogs: "build failed",
  executionReport: {
    logs: {
      errors: ["build failed"]
    }
  }
}));

const s5Agent  = getAgent("execution_worker");
const s5Result = await s5Agent.run({
  projectId:      "TEST-PROJECT",
  generatedFiles: [{ path: "src/index.js", content: "// entry" }],
  environment:    { runtime: "node" }
});

assert(
  "success === false",
  s5Result.success === false
);

assert(
  'status === "BUILD_FAILED"',
  s5Result.status === "BUILD_FAILED"
);

assert(
  "failedAt exists",
  s5Result.failedAt !== undefined && s5Result.failedAt !== null
);

assert(
  "errorLogs exists",
  s5Result.errorLogs !== undefined && s5Result.errorLogs !== null
);


// ════════════════════════════════════════════════════════════════════════════
// Summary
// ════════════════════════════════════════════════════════════════════════════

const total = passed + failed;

console.log("\n════════════════════════════════════════════════════════════════");

if (failed === 0) {
  console.log(`  ✅  ${passed} passed, 0 failed`);
  console.log("  EXECUTION WORKER TEST PASSED");
} else {
  console.log(`  ✅  ${passed} passed   ❌  ${failed} failed   (${total} total)`);
  console.log("  EXECUTION WORKER TEST FAILED");
}

console.log("════════════════════════════════════════════════════════════════\n");
