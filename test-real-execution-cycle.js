// ── ANNEXE AI — Real Execution Cycle Test ────────────────────────────────────
//
// Place at project root and run:
//   node test-real-execution-cycle.js
//
// Verifies the complete controlled build lifecycle:
//   Generated Files → Sandbox Workspace → Execution Worker
//   → Runner → Command Runner → Logs → Execution Report
//
// No mocks. Real sandbox, real node/npm commands.
//
// ─────────────────────────────────────────────────────────────────────────────

import { run as runWorker }  from "./api/agents/execution/worker.js";
import { cleanupWorkspace }  from "./api/sandbox/cleanup.js";


// ── Assertion helper ──────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label, condition, actual) {
  if (condition) {
    console.log(`✅  ${label}`);
    passed++;
  } else {
    console.log(`❌  ${label}  →  got: ${JSON.stringify(actual)}`);
    failed++;
  }
  return condition;
}


// ── Test input ────────────────────────────────────────────────────────────────

const PROJECT_ID = "REAL-EXECUTION-001";

const GENERATED_FILES = [
  {
    path: "package.json",
    content: JSON.stringify({
      name:    "annexe-test-project",
      version: "1.0.0",
      scripts: {
        build: "node index.js",
        test:  "node index.js"
      }
    }, null, 2)
  },
  {
    path:    "index.js",
    content: `console.log("ANNEXE REAL EXECUTION TEST");`
  }
];

const TECHNOLOGY = {
  frontend: {},
  backend:  {}
};


// ── Test runner ───────────────────────────────────────────────────────────────

async function runTest() {

  console.log("\n══════════════════════════════════════════════════════════");
  console.log("  ANNEXE AI — Real Execution Cycle Test");
  console.log("══════════════════════════════════════════════════════════\n");

  console.log("  Project ID:      ", PROJECT_ID);
  console.log("  Generated files: ", GENERATED_FILES.map(f => f.path).join(", "));
  console.log("  cwd:              (none — sandbox auto-created)");
  console.log();


  // ── Execute ───────────────────────────────────────────────────────────────

  let result;

  try {
    result = await runWorker({
      projectId:      PROJECT_ID,
      generatedFiles: GENERATED_FILES,
      technology:     TECHNOLOGY
      // cwd intentionally omitted — sandbox auto-creation path
    });
  } catch (err) {
    console.error("WORKER THREW UNEXPECTEDLY:", err);
    process.exit(1);
  }


  // ════════════════════════════════════════════════════════════════════════════
  // Stage 1 — Worker succeeds
  // ════════════════════════════════════════════════════════════════════════════

  console.log("── Stage 1: Worker succeeds ──────────────────────────────\n");

  assert("worker returns a result object",  result !== null && typeof result === "object", typeof result);
  assert("worker succeeds",                 result.success === true,                       result.success);
  assert("agent is execution_worker",       result.agent   === "execution_worker",         result.agent);


  // ════════════════════════════════════════════════════════════════════════════
  // Stage 2 — Status
  // ════════════════════════════════════════════════════════════════════════════

  console.log("\n── Stage 2: Status ───────────────────────────────────────\n");

  assert('status === "BUILD_SUCCESS"',      result.status  === "BUILD_SUCCESS",            result.status);


  // ════════════════════════════════════════════════════════════════════════════
  // Stage 3 — executionReport exists
  // ════════════════════════════════════════════════════════════════════════════

  console.log("\n── Stage 3: executionReport exists ──────────────────────\n");

  const report = result.executionReport;

  assert("executionReport exists",          !!report,                                      null);
  assert("executionReport is an object",    typeof report === "object",                    typeof report);
  assert("environment exists",              !!report.environment,                          null);
  assert("duration exists",                 typeof report.duration === "number",           report.duration);


  // ════════════════════════════════════════════════════════════════════════════
  // Stage 4 — commands array exists
  // ════════════════════════════════════════════════════════════════════════════

  console.log("\n── Stage 4: Commands array exists ───────────────────────\n");

  const commands = report.commands;

  assert("commands array exists",           Array.isArray(commands),                       commands);
  assert("commands array is not empty",     Array.isArray(commands) && commands.length > 0, commands?.length);


  // ════════════════════════════════════════════════════════════════════════════
  // Stage 5 — all commands have results
  // ════════════════════════════════════════════════════════════════════════════

  console.log("\n── Stage 5: All commands have results ───────────────────\n");

  if (Array.isArray(commands)) {
    for (const cmd of commands) {
      assert(
        `command "${cmd.command}" has a result`,
        cmd !== null && typeof cmd === "object" && typeof cmd.command === "string",
        cmd
      );
      assert(
        `command "${cmd.command}" has success field`,
        typeof cmd.success === "boolean",
        cmd.success
      );
      assert(
        `command "${cmd.command}" has exitCode`,
        "exitCode" in cmd,
        cmd.exitCode
      );
      assert(
        `command "${cmd.command}" has duration`,
        typeof cmd.duration === "number",
        cmd.duration
      );
    }
  }


  // ════════════════════════════════════════════════════════════════════════════
  // Stage 6 — logs exist
  // ════════════════════════════════════════════════════════════════════════════

  console.log("\n── Stage 6: Logs exist ───────────────────────────────────\n");

  const logs = report.logs;

  assert("logs object exists",              !!logs,                                        null);
  assert("logs.errors is array",            Array.isArray(logs?.errors),                  logs?.errors);
  assert("logs.warnings is array",          Array.isArray(logs?.warnings),                logs?.warnings);
  assert("logs.commands is array",          Array.isArray(logs?.commands),                logs?.commands);
  assert("logs.output is string",           typeof logs?.output === "string",             logs?.output);
  assert("logs.commands not empty",         Array.isArray(logs?.commands) &&
                                            logs.commands.length > 0,                     logs?.commands?.length);
  assert("no unexpected errors",            Array.isArray(logs?.errors) &&
                                            logs.errors.length === 0,                     logs?.errors);


  // ════════════════════════════════════════════════════════════════════════════
  // Stage 7 — Cleanup sandbox
  // ════════════════════════════════════════════════════════════════════════════

  console.log("\n── Stage 7: Cleanup sandbox ──────────────────────────────\n");

  const cleanup = await cleanupWorkspace({ projectId: PROJECT_ID });

  assert("cleanup succeeds",    cleanup.success === true,  cleanup.success);
  assert("cleanup removed dir", cleanup.removed  === true, cleanup.removed);

  console.log("  Sandbox removed for:", PROJECT_ID);


  // ════════════════════════════════════════════════════════════════════════════
  // Snapshot
  // ════════════════════════════════════════════════════════════════════════════

  if (result.executionReport) {
    console.log("\n── Execution Snapshot ────────────────────────────────────");
    console.log("  Runtime:   ", report.environment?.runtime  || "(detected)");
    console.log("  Commands:  ", (commands || []).map(c => c.command).join(", "));
    console.log("  Duration:  ", report.duration + "ms");
    console.log("  Errors:    ", logs?.errors?.length   ?? 0);
    console.log("  Warnings:  ", logs?.warnings?.length ?? 0);
  }


  // ════════════════════════════════════════════════════════════════════════════
  // Result
  // ════════════════════════════════════════════════════════════════════════════

  console.log("\n══════════════════════════════════════════════════════════");
  console.log(`  ✅  ${passed} passed, ${failed > 0 ? `❌  ${failed} failed` : "0 failed"}`);

  if (failed === 0) {
    console.log("  REAL EXECUTION CYCLE TEST PASSED");
  } else {
    console.log("  REAL EXECUTION CYCLE TEST FAILED");
  }

  console.log("══════════════════════════════════════════════════════════\n");

  if (failed > 0) process.exit(1);

}

runTest().catch(err => {
  console.error("TEST RUNNER ERROR:", err);
  process.exit(1);
});
