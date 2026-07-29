// ── ANNEXE AI — Code Generation Agent ────────────────────────────────────────
//
// Creates structured code proposals for the File Operation Agent to execute.
// Does NOT write files directly — outputs proposals only.
//
// LLM integration point: replace _generateFiles() internals with an API call
// when the factory is ready for live code generation.
//
// ─────────────────────────────────────────────────────────────────────────────

import { normalizeProposal }         from "./formatter.js";
import { validateGenerationProposal,
         validateFilePath }          from "./validator.js";


// ── Department → path/language routing ───────────────────────────────────────

const DEPARTMENT_ROUTING = {

  frontend: {
    baseDir:  "src/",
    language: "javascript",
    ext:      ".jsx"
  },

  backend: {
    baseDir:  "api/",
    language: "javascript",
    ext:      ".js"
  },

  database: {
    baseDir:  "database/",
    language: "sql",
    ext:      ".sql"
  },

  ai: {
    baseDir:  "ai/",
    language: "javascript",
    ext:      ".js"
  },

  // Fallback
  general: {
    baseDir:  "src/",
    language: "javascript",
    ext:      ".js"
  }

};


// ── Keyword → component name heuristic ───────────────────────────────────────

function deriveComponentName(title = "") {

  // Capitalise each word and strip non-alphanumeric chars
  return title
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");

}


// ── Placeholder content templates ─────────────────────────────────────────────
//
// These are deterministic stubs.
// Replace with LLM-generated content in the next integration phase.

function placeholderContent(action, path, language, task, context) {

  const name    = deriveComponentName(task.title || "Component");
  const desc    = task.description || task.title || "";
  const stamp   = new Date().toISOString();
  const stdNote = context?.codingStandards?.note || "";

  if (language === "sql") {
    return [
      `-- ANNEXE AI — Generated: ${stamp}`,
      `-- Task: ${desc}`,
      `-- Path: ${path}`,
      ``,
      `-- TODO: Replace with LLM-generated migration`,
      `CREATE TABLE IF NOT EXISTS ${name.toLowerCase()} (`,
      `  id SERIAL PRIMARY KEY,`,
      `  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
      `);`
    ].join("\n");
  }

  if (path.endsWith(".jsx")) {
    return [
      `// ANNEXE AI — Generated: ${stamp}`,
      `// Task: ${desc}`,
      `// ${stdNote}`,
      ``,
      `import React from "react";`,
      ``,
      `// TODO: Replace with LLM-generated component`,
      `export default function ${name}() {`,
      `  return (`,
      `    <div className="${name.toLowerCase()}-container">`,
      `      <h1>${name}</h1>`,
      `    </div>`,
      `  );`,
      `}`
    ].join("\n");
  }

  // Default JS module
  return [
    `// ANNEXE AI — Generated: ${stamp}`,
    `// Task: ${desc}`,
    `// ${stdNote}`,
    ``,
    `// TODO: Replace with LLM-generated implementation`,
    `export function ${name.charAt(0).toLowerCase() + name.slice(1)}() {`,
    `  // Implementation pending`,
    `}`,
    ``,
    `export default { ${name.charAt(0).toLowerCase() + name.slice(1)} };`
  ].join("\n");

}


// ── Test stub ─────────────────────────────────────────────────────────────────

function placeholderTest(filePath, name) {
  return {
    action:   "CREATE",
    path:     filePath.replace(/\.(jsx?|sql)$/, ".test.js").replace(/^(src|api|ai|database)\//, "tests/"),
    language: "javascript",
    content: [
      `// ANNEXE AI — Generated test stub`,
      `// Target: ${filePath}`,
      ``,
      `// TODO: Replace with LLM-generated test suite`,
      `describe("${name}", () => {`,
      `  it("should be implemented", () => {`,
      `    expect(true).toBe(true);`,
      `  });`,
      `});`
    ].join("\n"),
    reason: `Auto-generated test stub for ${filePath}`
  };
}


// ── CodeGenerationAgent ───────────────────────────────────────────────────────

export class CodeGenerationAgent {

  constructor() {
    this.agentName = "code_generation_agent";
  }


  // ── generate ────────────────────────────────────────────────────────────────

  generate(task, context = {}) {

    if (!task || !task.title) {
      return {
        success: false,
        error:   "task.title is required"
      };
    }

    const department = (task.department || "general").toLowerCase();
    const routing    = DEPARTMENT_ROUTING[department] || DEPARTMENT_ROUTING.general;
    const name       = deriveComponentName(task.title);
    const fileName   = name.charAt(0).toLowerCase() + name.slice(1) + routing.ext;
    const filePath   = routing.baseDir + fileName;

    // ── Validate the proposed path before building the proposal ───────────────

    const { valid: pathOk, error: pathErr } = validateFilePath(filePath);

    if (!pathOk) {
      return {
        success: false,
        error:   `Generated path rejected by security validator: ${pathErr}`
      };
    }

    // ── Build the primary file proposal ───────────────────────────────────────

    const primaryFile = {
      action:   "CREATE",
      path:     filePath,
      language: routing.language,
      content:  placeholderContent("CREATE", filePath, routing.language, task, context),
      reason:   `Auto-generated from task: "${task.title}"`
    };

    // ── Build test stub ───────────────────────────────────────────────────────

    const testFile = placeholderTest(filePath, name);

    // ── Assemble and normalise proposal ───────────────────────────────────────

    const raw = {
      files: [primaryFile],
      tests: [testFile]
    };

    const proposal = normalizeProposal(raw);

    // ── Validate proposal ─────────────────────────────────────────────────────

    const { valid, errors } = validateGenerationProposal(proposal);

    if (!valid) {
      return {
        success: false,
        error:   "Proposal validation failed",
        errors
      };
    }

    console.log(
      `CODE GENERATION AGENT: proposal ready — ${proposal.files.length} file(s) for task "${task.title}"`
    );

    return {
      success: true,
      agent:   this.agentName,
      task:    { title: task.title, department },
      proposal
    };

  }

}


// ── Singleton export ──────────────────────────────────────────────────────────

export const codeGenerationAgent = new CodeGenerationAgent();


// ── HTTP handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { task, context } = req.body || {};

    if (!task) {
      return res.status(400).json({ error: "task is required" });
    }

    const result = codeGenerationAgent.generate(task, context || {});

    return res.status(result.success ? 200 : 400).json(result);

  } catch (error) {

    console.error("CODE GENERATION AGENT ERROR:", error);

    return res.status(500).json({ error: "Code generation failed" });

  }

}
