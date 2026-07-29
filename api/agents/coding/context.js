// ── ANNEXE AI — Code Context Manager ─────────────────────────────────────────
//
// Assembles and maintains the context object passed to the Code Generation Agent.
// In-memory storage — swap adapter for PostgreSQL when persistence is needed.
//
// ─────────────────────────────────────────────────────────────────────────────


// ── Default coding standards ──────────────────────────────────────────────────

const DEFAULT_CODING_STANDARDS = {
  language:       "javascript",
  moduleSystem:   "ES modules",
  formatting:     "2-space indent, trailing newline",
  naming:         "camelCase functions, PascalCase classes/components",
  comments:       "JSDoc for exported functions",
  note:           "ANNEXE AI coding standard v1"
};


// ── CodeContextManager ────────────────────────────────────────────────────────

export class CodeContextManager {

  constructor() {
    // In-memory context store keyed by a session/project identifier
    this._contexts = new Map();
  }


  // ── createContext ───────────────────────────────────────────────────────────

  /**
   * Creates a fresh context object for a project.
   * Accepts a project object and seeds context from it where possible.
   *
   * @param {object} project
   * @returns {object} context
   */
  createContext(project = {}) {

    const context = {

      // Architecture snapshot from the project factory output
      architecture: project.architecture || {},

      // File list known to the agent (populated via addFileContext)
      files: [],

      // Coding conventions
      codingStandards: {
        ...DEFAULT_CODING_STANDARDS,
        ...(project.codingStandards || {})
      },

      // Agent working memory (arbitrary key/value)
      memory: {},

      // Metadata
      projectId:  project.projectId  || null,
      industry:   project.industry   || null,
      solution:   project.solution   || null,
      createdAt:  new Date().toISOString()

    };

    // Persist so callers can retrieve and mutate later
    if (project.projectId) {
      this._contexts.set(project.projectId, context);
    }

    return context;

  }


  // ── getContext ──────────────────────────────────────────────────────────────

  /**
   * Retrieves a context by projectId.
   *
   * @param {string} projectId
   * @returns {object|null}
   */
  getContext(projectId) {
    const ctx = this._contexts.get(projectId);
    return ctx ? { ...ctx, files: [...ctx.files] } : null;
  }


  // ── addFileContext ──────────────────────────────────────────────────────────

  /**
   * Adds a file record to an existing context.
   * Call this as the File Operation Agent creates/updates sandbox files.
   *
   * @param {string} projectId
   * @param {{ path: string, language: string, summary?: string }} file
   * @returns {object|null} updated context, or null if projectId not found
   */
  addFileContext(projectId, file) {

    const context = this._contexts.get(projectId);

    if (!context) {
      return null;
    }

    if (!file || !file.path) {
      return { ...context };
    }

    // Replace if a file with the same path already exists
    const idx = context.files.findIndex(f => f.path === file.path);

    const entry = {
      path:      file.path,
      language:  file.language  || "unknown",
      summary:   file.summary   || "",
      addedAt:   new Date().toISOString()
    };

    if (idx >= 0) {
      context.files[idx] = entry;
    } else {
      context.files.push(entry);
    }

    return { ...context, files: [...context.files] };

  }


  // ── addMemory ───────────────────────────────────────────────────────────────

  /**
   * Stores an arbitrary key/value pair in the context's working memory.
   *
   * @param {string} projectId
   * @param {string} key
   * @param {*}      value
   * @returns {object|null} updated context, or null if projectId not found
   */
  addMemory(projectId, key, value) {

    const context = this._contexts.get(projectId);

    if (!context) {
      return null;
    }

    context.memory[key] = value;

    return { ...context, files: [...context.files] };

  }

}


// ── Singleton export ──────────────────────────────────────────────────────────

export const codeContextManager = new CodeContextManager();
