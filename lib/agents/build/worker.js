// ── ANNEXE AI — Build Worker ──────────────────────────────────────────────────
//
// Pure build-planning layer.  Receives generated files + architecture +
// technology stack and produces a structured buildReport describing what build
// commands WOULD run and in what order.
//
// NO shell execution.  NO file system writes.  NO external API calls.
// This is a planning agent — identical in philosophy to runDeveloperAgent
// producing a developmentPlan without writing code.
//
// Input shape:
//   {
//     projectId,        // string
//     generatedFiles,   // array of { path, type, status }  ← REQUIRED
//     architecture,     // object — frontend/backend/database shapes
//     technology,       // object — framework names per layer
//     sandboxId         // string — optional, passed through for traceability
//   }
//
// Output shape:
//   {
//     success: true,
//     agent:   "build_worker",
//     status:  "BUILD_PLAN_READY",
//     buildReport: {
//       projectId,
//       sandboxId,
//       fileInventory,
//       stages,
//       buildOrder,
//       estimatedDuration,
//       warnings
//     },
//     _meta: { ... }
//   }
//
// ─────────────────────────────────────────────────────────────────────────────

import {
  getBackendSteps,
  getFrontendSteps,
  getDatabaseSteps,
  classifyFile
} from "./executor.js";


// ── Main exported function ────────────────────────────────────────────────────

export function runBuildWorker({
  projectId,
  generatedFiles,
  architecture,
  technology,
  sandboxId = null
} = {}) {


  // ── Guard: generatedFiles is the minimum required input ───────────────────

  if (!generatedFiles || !Array.isArray(generatedFiles) || generatedFiles.length === 0) {
    return {
      success:     false,
      agent:       "build_worker",
      status:      "BUILD_PLAN_FAILED",
      error:       "generatedFiles is required and must be a non-empty array",
      buildReport: null
    };
  }


  // ── 1. Resolve framework names ────────────────────────────────────────────
  //
  // Accept from technology.frontend/backend/database (agent-mapper shape)
  // or fall back to architecture.frontend/backend/database (architect shape).

  const backendFramework =
    technology?.backend?.technology  ||
    technology?.backend              ||
    architecture?.backend?.framework ||
    "default";

  const frontendFramework =
    technology?.frontend?.technology  ||
    technology?.frontend              ||
    architecture?.frontend?.framework ||
    "default";

  const databaseEngine =
    technology?.database?.technology  ||
    technology?.database              ||
    architecture?.database?.engine    ||
    "default";


  // ── 2. Classify every generated file into a build stage ──────────────────

  const fileInventory = generatedFiles.map(f => {
    const filePath = f.path || f.filePath || f.name || "unknown";
    return {
      path:        filePath,
      originalType: f.type   || "unknown",
      buildStage:  classifyFile(filePath),
      status:      f.status  || "generated"
    };
  });

  // Counts per stage for _meta
  const stageCounts = fileInventory.reduce((acc, f) => {
    acc[f.buildStage] = (acc[f.buildStage] || 0) + 1;
    return acc;
  }, {});


  // ── 3. Build stage definitions ────────────────────────────────────────────

  const stages = {

    database: {
      name:      "Database Migration",
      framework: databaseEngine,
      files:     fileInventory.filter(f => f.buildStage === "database"),
      steps:     getDatabaseSteps(databaseEngine)
    },

    backend: {
      name:      "Backend Build",
      framework: backendFramework,
      files:     fileInventory.filter(f => f.buildStage === "backend"),
      steps:     getBackendSteps(backendFramework)
    },

    frontend: {
      name:      "Frontend Build",
      framework: frontendFramework,
      files:     fileInventory.filter(f => f.buildStage === "frontend"),
      steps:     getFrontendSteps(frontendFramework)
    },

    tests: {
      name:   "Test Execution",
      files:  fileInventory.filter(f => f.buildStage === "test"),
      steps: [
        { order: 1, stage: "test", command: "npm test",    description: "Run full test suite" },
        { order: 2, stage: "test", command: "npm run e2e", description: "Run end-to-end tests" }
      ]
    },

    config: {
      name:  "Configuration Validation",
      files: fileInventory.filter(f => f.buildStage === "config"),
      steps: [
        { order: 1, stage: "validate", command: "node scripts/validate-env.js", description: "Validate environment variables" }
      ]
    }

  };


  // ── 4. Build order ────────────────────────────────────────────────────────
  //
  // Database must run before backend (schema needed for models).
  // Backend must run before frontend (API contract needed).
  // Tests run after all build stages.

  const buildOrder = [
    "database",
    "backend",
    "frontend",
    "tests",
    "config"
  ];


  // ── 5. Estimated duration ─────────────────────────────────────────────────
  //
  // Pure estimate based on file counts — no real timing, no shell calls.

  const totalFiles  = fileInventory.length;
  const baseMinutes = 5;                            // fixed overhead
  const perFile     = 0.5;                          // 30 seconds per file
  const estimated   = Math.ceil(baseMinutes + totalFiles * perFile);

  const estimatedDuration = {
    minutes:     estimated,
    description: `Estimated ${estimated} minutes for ${totalFiles} files across ${buildOrder.length} stages`
  };


  // ── 6. Warnings ───────────────────────────────────────────────────────────

  const warnings = [];

  if (stageCounts["database"] === 0) {
    warnings.push("No database migration files detected — verify schema is handled externally");
  }

  if (stageCounts["backend"] === 0) {
    warnings.push("No backend source files detected — backend stage will run with no file targets");
  }

  if (stageCounts["frontend"] === 0) {
    warnings.push("No frontend source files detected — frontend stage will run with no file targets");
  }

  if (stageCounts["test"] === 0) {
    warnings.push("No test files detected — test stage will rely on framework defaults");
  }

  if (!sandboxId) {
    warnings.push("sandboxId not provided — build plan is not linked to a sandbox environment");
  }


  // ── Assemble build report ─────────────────────────────────────────────────

  const buildReport = {
    projectId:         projectId || "UNKNOWN",
    sandboxId:         sandboxId || null,
    fileInventory,
    stages,
    buildOrder,
    estimatedDuration,
    warnings
  };


  return {
    success:     true,
    agent:       "build_worker",
    status:      "BUILD_PLAN_READY",
    buildReport,
    _meta: {
      projectId:         projectId  || "UNKNOWN",
      sandboxId:         sandboxId  || null,
      totalFiles:        fileInventory.length,
      stageCounts,
      backendFramework,
      frontendFramework,
      databaseEngine,
      estimatedMinutes:  estimated,
      warningCount:      warnings.length,
      plannedAt:         new Date().toISOString()
    }
  };

}


// ── HTTP handler (for direct Vercel route testing) ────────────────────────────

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const {
      projectId,
      generatedFiles,
      architecture,
      technology,
      sandboxId
    } = req.body || {};

    const result = runBuildWorker({
      projectId,
      generatedFiles,
      architecture,
      technology,
      sandboxId
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {

    console.error("BUILD WORKER ERROR:", error);

    return res.status(500).json({ error: "Build worker failed" });

  }

}
