// ── ANNEXE AI — Execution Engine: Environment Detection ──────────────────────
//
// Phase 4 | Autonomous Execution Engine
//
// Detects the runtime environment for a project before any execution begins.
// Pure logic only — no shell calls, no filesystem access, no API calls.
// Reads two signal sources:
//   1. technology  — output of the Technology Intelligence Agent
//   2. generatedFiles — array of filenames produced by the project pipeline
//
// Input:
//   { technology, generatedFiles }
//
// Output:
//   { success: true, environment: { runtime, framework, packageManager, detectedFiles } }
//   { success: false, error: string }
//
// ─────────────────────────────────────────────────────────────────────────────


// ── Constants ─────────────────────────────────────────────────────────────────

const RUNTIMES = {
  NODE:   "node",
  PYTHON: "python"
};

const FRAMEWORKS = {
  NEXTJS:  "Next.js",
  REACT:   "React",
  NODE:    "Node.js",
  FASTAPI: "FastAPI",
  PYTHON:  "Python"
};

const PACKAGE_MANAGERS = {
  NPM: "npm",
  PIP: "pip"
};


// ── Signal: Node.js indicator filenames ──────────────────────────────────────

const NODE_INDICATOR_FILES = [
  "package.json",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  ".nvmrc",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "vite.config.js",
  "vite.config.ts"
];


// ── Signal: Python indicator filenames ───────────────────────────────────────

const PYTHON_INDICATOR_FILES = [
  "requirements.txt",
  "requirements-dev.txt",
  "pyproject.toml",
  "setup.py",
  "setup.cfg",
  "Pipfile",
  "Pipfile.lock",
  "poetry.lock",
  "main.py",
  "app.py",
  "run.py"
];


// ── Signal: Framework keywords in technology strings ─────────────────────────

const FRAMEWORK_KEYWORDS = {
  [FRAMEWORKS.NEXTJS]:  ["next.js", "nextjs", "next js"],
  [FRAMEWORKS.REACT]:   ["react"],
  [FRAMEWORKS.NODE]:    ["node.js", "nodejs", "node js", "express", "koa", "hapi", "fastify"],
  [FRAMEWORKS.FASTAPI]: ["fastapi", "fast api"],
  [FRAMEWORKS.PYTHON]:  ["python", "flask", "django", "starlette", "uvicorn"]
};


// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Flatten all string values from a technology object into one lowercase string.
 * Handles nested objects (e.g. technology.frontend.technology = "Next.js").
 */
function flattenTechnologyToString(technology) {

  if (!technology || typeof technology !== "object") {
    return "";
  }

  const values = [];

  function walk(node) {
    if (typeof node === "string") {
      values.push(node.toLowerCase());
    } else if (Array.isArray(node)) {
      node.forEach(walk);
    } else if (node && typeof node === "object") {
      Object.values(node).forEach(walk);
    }
  }

  walk(technology);

  return values.join(" ");

}


/**
 * Normalise a filename for comparison:
 * - lowercase
 * - strip leading path segments (keep basename only)
 */
function normaliseFilename(filename) {

  if (typeof filename !== "string") return "";

  // Accept both forward slash and backslash separators
  const parts = filename.replace(/\\/g, "/").split("/");

  return parts[parts.length - 1].toLowerCase().trim();

}


/**
 * Check which indicator filenames from a reference list appear
 * in the generatedFiles array. Returns matched basenames.
 */
function matchIndicatorFiles(generatedFiles, indicatorList) {

  if (!Array.isArray(generatedFiles) || generatedFiles.length === 0) {
    return [];
  }

  const normalisedInput = generatedFiles.map(normaliseFilename);
  const normalisedIndicators = indicatorList.map(f => f.toLowerCase());

  return normalisedIndicators.filter(indicator =>
    normalisedInput.includes(indicator)
  );

}


/**
 * Detect framework from a technology string blob.
 * Returns the first matched framework name, or null.
 * Priority order: Next.js → React → FastAPI → Python → Node.js
 * (More specific frameworks take priority over generic runtimes.)
 */
function detectFrameworkFromString(techString) {

  const lower = techString.toLowerCase();

  // Ordered by specificity — most specific first
  const priorityOrder = [
    FRAMEWORKS.NEXTJS,
    FRAMEWORKS.FASTAPI,
    FRAMEWORKS.REACT,
    FRAMEWORKS.PYTHON,
    FRAMEWORKS.NODE
  ];

  for (const framework of priorityOrder) {
    const keywords = FRAMEWORK_KEYWORDS[framework];
    if (keywords.some(keyword => lower.includes(keyword))) {
      return framework;
    }
  }

  return null;

}


// ── Runtime resolution ────────────────────────────────────────────────────────

/**
 * Resolve runtime from:
 * 1. File signals (most concrete evidence)
 * 2. Technology string signals (agent-provided metadata)
 *
 * Returns { runtime, source } where source explains why this decision was made.
 */
function resolveRuntime(nodeFiles, pythonFiles, techString) {

  const hasNodeFiles   = nodeFiles.length   > 0;
  const hasPythonFiles = pythonFiles.length > 0;

  // Both signals present — file evidence decides, Node wins ties
  if (hasNodeFiles && hasPythonFiles) {

    // If Next.js / React files exist alongside Python files,
    // treat as a full-stack project: primary runtime is Node (frontend)
    // and Python is the secondary (backend). Return Node as the primary.
    return {
      runtime: RUNTIMES.NODE,
      source:  "mixed_file_signals_node_primary"
    };

  }

  if (hasNodeFiles) {
    return {
      runtime: RUNTIMES.NODE,
      source:  "file_signal"
    };
  }

  if (hasPythonFiles) {
    return {
      runtime: RUNTIMES.PYTHON,
      source:  "file_signal"
    };
  }

  // No file signals — fall back to technology string
  const frameworkFromTech = detectFrameworkFromString(techString);

  if (frameworkFromTech === FRAMEWORKS.FASTAPI || frameworkFromTech === FRAMEWORKS.PYTHON) {
    return {
      runtime: RUNTIMES.PYTHON,
      source:  "technology_signal"
    };
  }

  if (
    frameworkFromTech === FRAMEWORKS.NEXTJS ||
    frameworkFromTech === FRAMEWORKS.REACT  ||
    frameworkFromTech === FRAMEWORKS.NODE
  ) {
    return {
      runtime: RUNTIMES.NODE,
      source:  "technology_signal"
    };
  }

  // Cannot determine
  return {
    runtime: null,
    source:  "unresolved"
  };

}


/**
 * Resolve framework from technology string and confirmed runtime.
 * Falls back to the runtime's default generic framework if nothing specific found.
 */
function resolveFramework(techString, runtime) {

  const detected = detectFrameworkFromString(techString);

  if (detected) return detected;

  // Generic fallback by runtime
  if (runtime === RUNTIMES.NODE)   return FRAMEWORKS.NODE;
  if (runtime === RUNTIMES.PYTHON) return FRAMEWORKS.PYTHON;

  return null;

}


/**
 * Resolve package manager from runtime.
 */
function resolvePackageManager(runtime) {

  if (runtime === RUNTIMES.NODE)   return PACKAGE_MANAGERS.NPM;
  if (runtime === RUNTIMES.PYTHON) return PACKAGE_MANAGERS.PIP;

  return null;

}


// ── Main export ───────────────────────────────────────────────────────────────

/**
 * detectEnvironment
 *
 * Detects the execution environment from pipeline-provided signals.
 * Pure function — no side effects.
 *
 * @param {object} input
 * @param {object} [input.technology]       Technology object from Technology Intelligence Agent
 * @param {string[]} [input.generatedFiles] Filenames produced by the project pipeline
 *
 * @returns {{ success: boolean, environment?: object, error?: string }}
 */
export function detectEnvironment(input = {}) {

  try {

    const { technology, generatedFiles } = input;


    // ── Step 1: Build technology signal string ────────────────────────────────

    const techString = flattenTechnologyToString(technology);


    // ── Step 2: Match indicator files ────────────────────────────────────────

    const matchedNodeFiles   = matchIndicatorFiles(generatedFiles, NODE_INDICATOR_FILES);
    const matchedPythonFiles = matchIndicatorFiles(generatedFiles, PYTHON_INDICATOR_FILES);

    const detectedFiles = [
      ...matchedNodeFiles,
      ...matchedPythonFiles
    ];


    // ── Step 3: Resolve runtime ───────────────────────────────────────────────

    const { runtime, source: runtimeSource } = resolveRuntime(
      matchedNodeFiles,
      matchedPythonFiles,
      techString
    );


    // ── Step 4: Resolve framework ─────────────────────────────────────────────

    const framework = resolveFramework(techString, runtime);


    // ── Step 5: Resolve package manager ──────────────────────────────────────

    const packageManager = resolvePackageManager(runtime);


    // ── Step 6: Assemble environment object ───────────────────────────────────

    const environment = {
      runtime,
      framework,
      packageManager,
      detectedFiles,

      // Internal diagnostics — available for logging / debugging
      _signals: {
        runtimeSource,
        nodeFilesMatched:   matchedNodeFiles,
        pythonFilesMatched: matchedPythonFiles,
        technologyString:   techString.slice(0, 200)  // truncated for log safety
      }
    };


    // ── Step 7: Validate — refuse to return a half-detected environment ───────

    if (!runtime) {

      return {
        success:     false,
        environment: null,
        error:       "Environment detection failed: could not determine runtime. " +
                     "Provide a technology object or generatedFiles containing " +
                     "package.json (Node.js) or requirements.txt (Python)."
      };

    }


    return {
      success: true,
      environment
    };


  } catch (detectionError) {

    return {
      success:     false,
      environment: null,
      error:       "Environment detection threw an unexpected error: " + detectionError.message
    };

  }

}


// ── HTTP handler — for direct Vercel serverless testing ───────────────────────

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { technology, generatedFiles } = req.body || {};

    const result = detectEnvironment({ technology, generatedFiles });

    return res.status(result.success ? 200 : 422).json(result);

  } catch (error) {

    console.error("ENVIRONMENT DETECTION ERROR:", error);

    return res.status(500).json({ error: "Environment detection failed" });

  }

}