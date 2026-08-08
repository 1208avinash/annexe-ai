// ── ANNEXE AI — Debug Worker Agent ───────────────────────────────────────────
//
// Analyzes build/test failures and produces a structured patch proposal.
// V1: read-only — no files are modified. Diagnosis + patch plan only.
//
// INPUT CONTRACT:
//   { projectId, errorLogs, buildReport, generatedFiles }
//
// OUTPUT CONTRACT (success):
//   { success: true, agent, projectId, diagnosis, patchPlan, _meta }
//
// OUTPUT CONTRACT (failure):
//   { success: false, agent, projectId, error }
//
// ─────────────────────────────────────────────────────────────────────────────


// ── Constants ─────────────────────────────────────────────────────────────────

const AGENT_ID  = "debug_worker";
const VERSION   = "1.0.0";

// Error pattern → category classifier
// Order matters: first match wins
const ERROR_PATTERNS = [
  { pattern: /cannot find module|module not found|import.*failed/i,  category: "import_error"   },
  { pattern: /syntaxerror|unexpected token|unexpected end/i,          category: "syntax_error"   },
  { pattern: /typeerror|is not a function|is not defined/i,           category: "type_error"     },
  { pattern: /enoent|no such file|file not found/i,                   category: "missing_file"   },
  { pattern: /timeout|timed out/i,                                    category: "timeout"        },
  { pattern: /permission denied|eacces/i,                             category: "permission"     },
  { pattern: /network|fetch failed|econnrefused/i,                    category: "network_error"  },
  { pattern: /assertion.*failed|expect.*received|test.*failed/i,      category: "test_failure"   }
];

// Category → suggested action
const PATCH_STRATEGIES = {
  import_error:   "Verify import paths and ensure the referenced module is exported correctly.",
  syntax_error:   "Review the flagged file for syntax issues — missing brackets, commas, or keywords.",
  type_error:     "Confirm the referenced value is defined and has the expected type before use.",
  missing_file:   "Check that all referenced files exist and are included in the build output.",
  timeout:        "Investigate async operations — add timeouts or reduce blocking calls.",
  permission:     "Check file system permissions or environment variable access.",
  network_error:  "Verify external service URLs, credentials, and network availability.",
  test_failure:   "Review test assertions against current implementation — contracts may have drifted.",
  unknown:        "Inspect full error logs manually — no automatic pattern matched."
};


// ── Classifier ────────────────────────────────────────────────────────────────

/**
 * classifyError
 * Returns the error category for a given log string.
 *
 * @param {string} logText
 * @returns {string} category key
 */
function classifyError(logText) {
  for (const { pattern, category } of ERROR_PATTERNS) {
    if (pattern.test(logText)) return category;
  }
  return "unknown";
}


// ── File extractor ────────────────────────────────────────────────────────────

/**
 * extractAffectedFiles
 * Heuristically extracts file references from error log text.
 * Looks for common path patterns (relative paths, .js/.ts/.json mentions).
 *
 * @param {string} logText
 * @returns {string[]} deduplicated list of suspected file paths
 */
function extractAffectedFiles(logText) {
  const pathPattern = /(?:at |from |in |open |require\(|import\s+['"])([\w./@-]+\.[jt]sx?|[\w./@-]+\.json)/g;
  const found       = new Set();
  let match;

  while ((match = pathPattern.exec(logText)) !== null) {
    found.add(match[1]);
  }

  return [...found].slice(0, 10);   // cap at 10 to avoid noise
}


// ── Patch plan builder ────────────────────────────────────────────────────────

/**
 * buildPatchPlan
 * Constructs a structured patch proposal from classified error data.
 *
 * @param {string}   category      - From classifyError()
 * @param {string[]} affectedFiles - From extractAffectedFiles()
 * @param {string}   errorLogs     - Raw log text
 * @returns {object} patchPlan
 */
function buildPatchPlan(category, affectedFiles, errorLogs) {

  const strategy = PATCH_STRATEGIES[category] || PATCH_STRATEGIES.unknown;

  return {
    // What needs fixing
    errorCategory:  category,
    strategy,

    // Where to look
    affectedFiles,

    // Concrete steps for a developer or future V2 auto-patcher
    steps: [
      `1. Identify the root error in the logs (category detected: ${category}).`,
      `2. ${strategy}`,
      `3. Re-run the build after each change — do not batch fixes.`,
      `4. If the issue persists, escalate to manual review.`
    ],

    // V1 read-only flag — no automatic writes
    autoApplied: false,
    requiresHumanReview: true
  };

}


// ── Main exported run() ───────────────────────────────────────────────────────

/**
 * run
 *
 * @param {object} input
 * @param {string} input.projectId      - Project identifier
 * @param {string} [input.errorLogs]    - Raw error log text
 * @param {string} [input.buildReport]  - Build system report (may overlap errorLogs)
 * @param {Array}  [input.generatedFiles] - File list from generation stage
 *
 * @returns {object} Debug worker output
 */
export function run({
  projectId      = null,
  errorLogs      = "",
  buildReport    = "",
  generatedFiles = []
} = {}) {

  // ── Guard ────────────────────────────────────────────────────────────────

  if (!projectId) {
    return {
      success:   false,
      agent:     AGENT_ID,
      projectId: null,
      error:     "projectId is required"
    };
  }


  // ── Combine available log sources ────────────────────────────────────────

  const combinedLogs = [errorLogs, buildReport].filter(Boolean).join("\n");

  if (!combinedLogs.trim()) {
    return {
      success:   false,
      agent:     AGENT_ID,
      projectId,
      error:     "No error logs or build report provided — nothing to debug"
    };
  }


  // ── Classify and analyse ─────────────────────────────────────────────────

  const errorCategory  = classifyError(combinedLogs);
  const affectedFiles  = extractAffectedFiles(combinedLogs);
  const patchPlan      = buildPatchPlan(errorCategory, affectedFiles, combinedLogs);


  // ── Diagnosis summary ────────────────────────────────────────────────────

  const diagnosis = {
    errorCategory,
    affectedFileCount: affectedFiles.length,
    affectedFiles,
    logLength:         combinedLogs.length,
    summary:
      affectedFiles.length > 0
        ? `Detected ${errorCategory} affecting ${affectedFiles.length} file(s): ${affectedFiles.join(", ")}`
        : `Detected ${errorCategory} — no specific file references found in logs`
  };


  return {
    success:   true,
    agent:     AGENT_ID,
    version:   VERSION,
    projectId,

    diagnosis,
    patchPlan,

    _meta: {
      generatedFileCount: generatedFiles.length,
      logSources:         [errorLogs && "errorLogs", buildReport && "buildReport"].filter(Boolean),
      analyzedAt:         new Date().toISOString()
    }
  };

}


// ── HTTP handler (standalone Vercel deployment) ───────────────────────────────

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const {
      projectId,
      errorLogs,
      buildReport,
      generatedFiles
    } = req.body || {};

    const result = run({ projectId, errorLogs, buildReport, generatedFiles });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {

    console.error("DEBUG WORKER ERROR:", error);

    return res.status(500).json({ error: "Debug worker failed" });

  }

}
