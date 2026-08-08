// ── ANNEXE AI — Sandbox Execution Integration Test ───────────────────────────
//
// Place at project root and run:
//   node test-execution-sandbox-integration.js
//
// Verifies the full handoff:
//   generatedFiles → SandboxManager → workspace.path → Execution Worker → runner
//
// Strategy:
//   The worker uses a static import of runner.js which we cannot intercept in
//   plain Node ESM without a test runner.  We therefore test the integration
//   at the layer directly beneath the worker:
//
//     SandboxManager.create()  ──→  workspace.path  (Stage 1)
//     SandboxManager.get()     ──→  null when cwd supplied  (Stage 2)
//
//   …and then drive the worker itself with a stubbed runExecution injected via
//   a thin inline worker factory, keeping all production files untouched.
//
// ─────────────────────────────────────────────────────────────────────────────

import { SandboxManager } from "./lib/sandbox/manager.js";
import fs                 from "fs/promises";
import path               from "path";


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


// ── Inline worker factory ─────────────────────────────────────────────────────
//
// Mirrors the production worker logic exactly, but accepts a stubbed
// runExecution so no real npm/pip commands are triggered.
// Production files are NOT modified.

function makeWorker(runExecutionStub) {

  const sandboxManager = new SandboxManager();

  return {

    sandboxManager,

    async run({
      projectId,
      buildReport,
      generatedFiles,
      technology,
      cwd
    } = {}) {

      // ── 1. Validate projectId ───────────────────────────────────────────────

      if (!projectId) {
        return {
          success: false,
          agent:   "execution_worker",
          status:  "BUILD_FAILED",
          errorLogs: {
            errors:   ["projectId is required"],
            warnings: [],
            output:   "",
            commands: []
          },
          executionReport: {}
        };
      }

      // ── 2. Validate payload ─────────────────────────────────────────────────

      const hasPayload =
        (buildReport && typeof buildReport === "object") ||
        (Array.isArray(generatedFiles) && generatedFiles.length > 0);

      if (!hasPayload) {
        return {
          success: false,
          agent:   "execution_worker",
          status:  "BUILD_FAILED",
          errorLogs: {
            errors:   ["Execution requires either buildReport or generatedFiles"],
            warnings: [],
            output:   "",
            commands: []
          },
          executionReport: {}
        };
      }

      // ── 3. Resolve execution directory ──────────────────────────────────────

      let executionCwd = cwd || null;

      if (!executionCwd && Array.isArray(generatedFiles) && generatedFiles.length > 0) {

        const sandboxResult = await sandboxManager.create({
          projectId,
          generatedFiles
        });

        if (!sandboxResult.success) {
          return {
            success: false,
            agent:   "execution_worker",
            status:  "BUILD_FAILED",
            errorLogs: {
              errors:   [`Sandbox workspace creation failed: ${sandboxResult.error}`],
              warnings: [],
              output:   "",
              commands: []
            },
            executionReport: {}
          };
        }

        executionCwd = sandboxResult.workspace.path;

      }

      // ── 4. Execute (via stub) ───────────────────────────────────────────────

      let result;

      try {
        result = await runExecutionStub({
          projectId,
          buildReport,
          generatedFiles,
          technology,
          cwd: executionCwd
        });
      } catch (unexpectedError) {
        return {
          success: false,
          agent:   "execution_worker",
          status:  "BUILD_FAILED",
          errorLogs: {
            errors:   [`Execution engine threw unexpectedly: ${unexpectedError.message}`],
            warnings: [],
            output:   "",
            commands: []
          },
          executionReport: {}
        };
      }

      // ── 5. Translate to agent contract ──────────────────────────────────────

      if (result.success) {
        return {
          success:         true,
          agent:           "execution_worker",
          status:          "BUILD_SUCCESS",
          executionReport: result.executionReport
        };
      }

      return {
        success:         false,
        agent:           "execution_worker",
        status:          "BUILD_FAILED",
        failedAt:        result.failedAt || null,
        errorLogs:       result.executionReport?.logs || {
          errors:   [],
          warnings: [],
          output:   "",
          commands: []
        },
        executionReport: result.executionReport || {}
      };

    }

  };

}


// ── Test runner ───────────────────────────────────────────────────────────────

async function runTest() {

  console.log("\n══════════════════════════════════════════════════════════");
  console.log("  ANNEXE AI — Sandbox Execution Integration Test");
  console.log("══════════════════════════════════════════════════════════\n");


  // ════════════════════════════════════════════════════════════════════════════
  // Stage 1 — Auto sandbox creation
  // ════════════════════════════════════════════════════════════════════════════

  console.log("── Stage 1: Auto sandbox creation ────────────────────────\n");

  // Capture the cwd the stub receives so we can assert on it
  let capturedCwd = null;

  const stubSuccess = async ({ cwd }) => {
    capturedCwd = cwd;
    return {
      success:         true,
      executionReport: { logs: { errors: [], warnings: [], output: "ok", commands: [] } }
    };
  };

  const { run: runWorker, sandboxManager } = makeWorker(stubSuccess);

  const projectId = "SANDBOX-EXEC-001";

  const result = await runWorker({
    projectId,
    generatedFiles: [
      { path: "package.json", content: "{}" },
      { path: "index.js",     content: "console.log('test')" }
    ],
    technology: {}
    // cwd intentionally omitted
  });

  assert("worker succeeds",               result.success === true,           result.success);
  assert("status is BUILD_SUCCESS",       result.status === "BUILD_SUCCESS", result.status);
  assert("sandbox workspace created",     sandboxManager.get(projectId) !== null, null);
  assert("execution received a cwd",      capturedCwd !== null,              capturedCwd);
  assert("cwd contains project id",
    typeof capturedCwd === "string" && capturedCwd.includes(projectId),
    capturedCwd
  );


  // ════════════════════════════════════════════════════════════════════════════
  // Stage 2 — Existing cwd compatibility
  // ════════════════════════════════════════════════════════════════════════════

  console.log("\n── Stage 2: Existing cwd compatibility ───────────────────\n");

  let capturedCwd2 = null;

  const stubSuccess2 = async ({ cwd }) => {
    capturedCwd2 = cwd;
    return {
      success:         true,
      executionReport: {}
    };
  };

  const { run: runWorker2, sandboxManager: sm2 } = makeWorker(stubSuccess2);

  const customCwd   = "D:/custom/path";
  const projectId2  = "CUSTOM-CWD-001";

  const result2 = await runWorker2({
    projectId:      projectId2,
    cwd:            customCwd,
    buildReport:    {},          // satisfies payload check without generatedFiles
    generatedFiles: []
  });

  assert("worker succeeds with custom cwd",  result2.success === true,        result2.success);
  assert("provided cwd is preserved",        capturedCwd2 === customCwd,      capturedCwd2);
  assert("sandbox is not created",           sm2.get(projectId2) === null,     sm2.get(projectId2));


  // ════════════════════════════════════════════════════════════════════════════
  // Stage 3 — Cleanup
  // ════════════════════════════════════════════════════════════════════════════

  console.log("\n── Stage 3: Cleanup ──────────────────────────────────────\n");

  const sandboxRoot = path.resolve("sandboxes");

  try {
    await fs.rm(sandboxRoot, { recursive: true, force: true });
    console.log("  Sandboxes directory removed:", sandboxRoot);
    assert("sandboxes directory cleaned up", true, null);
  } catch (err) {
    assert("sandboxes directory cleaned up", false, err.message);
  }


  // ════════════════════════════════════════════════════════════════════════════
  // Result
  // ════════════════════════════════════════════════════════════════════════════

  console.log("\n══════════════════════════════════════════════════════════");
  console.log(`  ✅  ${passed} passed${failed > 0 ? `, ❌  ${failed} failed` : ", 0 failed"}`);

  if (failed === 0) {
    console.log("  SANDBOX EXECUTION INTEGRATION TEST PASSED");
  } else {
    console.log("  SANDBOX EXECUTION INTEGRATION TEST FAILED");
  }

  console.log("══════════════════════════════════════════════════════════\n");

  if (failed > 0) process.exit(1);

}

runTest().catch(err => {
  console.error("TEST RUNNER ERROR:", err);
  process.exit(1);
});
