// ── ANNEXE AI — Patch Executor ───────────────────────────────────────────────
//
// Phase 7.1
//
// Single responsibility:
//   Accept an APPROVED patch plan and apply every patch to the sandbox
//   filesystem for the target project.
//
// Does NOT:
//   - Generate patches
//   - Analyze or diagnose code
//   - Call the debug or execution worker
//   - Rebuild or deliver the project
//   - Access any database
//
// Supported patch actions:
//   replace_file  — overwrite a file with new content
//   create_file   — create a new file (and any missing parent directories)
//   delete_file   — delete a file if it exists; silently skip if absent
//   append_file   — append content to the end of an existing file
//   prepend_file  — prepend content to the beginning of an existing file
//
// Security:
//   All resolved paths are checked to confirm they remain inside the sandbox
//   root.  Any path traversal attempt is rejected and logged as an error;
//   remaining patches continue to be processed.
//
// ─────────────────────────────────────────────────────────────────────────────

import path    from "path";
import fs      from "fs/promises";
import { SandboxManager } from "../sandbox/manager.js";


// ── Constants ─────────────────────────────────────────────────────────────────

const SUPPORTED_ACTIONS = new Set([
  "replace_file",
  "create_file",
  "delete_file",
  "append_file",
  "prepend_file"
]);


// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * resolveSecure
 *
 * Resolve `filePath` relative to `sandboxRoot` and verify the result
 * does not escape the sandbox.
 *
 * @param {string} sandboxRoot  - Absolute path to the workspace directory
 * @param {string} filePath     - Relative file path from the patch entry
 * @returns {string}            - Absolute, safe target path
 * @throws  {Error}             - If the resolved path escapes the sandbox
 */
function resolveSecure(sandboxRoot, filePath) {

  // Normalise to remove any ".." components before resolving
  const resolved = path.resolve(sandboxRoot, filePath);

  // The resolved path must start with the sandbox root (with trailing sep)
  const root = sandboxRoot.endsWith(path.sep)
    ? sandboxRoot
    : sandboxRoot + path.sep;

  if (!resolved.startsWith(root) && resolved !== sandboxRoot) {
    throw new Error(
      `Path traversal rejected: '${filePath}' resolves outside sandbox`
    );
  }

  return resolved;

}


/**
 * ensureDir
 *
 * Create all parent directories for `filePath` if they do not exist.
 *
 * @param {string} filePath - Absolute path to the target file
 */
async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}


// ── PatchExecutor ─────────────────────────────────────────────────────────────

export class PatchExecutor {

  /**
   * @param {object}        [options]
   * @param {SandboxManager} [options.sandboxManager] - Injected sandbox manager.
   *                                                    Creates its own if omitted.
   */
  constructor({ sandboxManager } = {}) {

    this._sandboxManager = sandboxManager || new SandboxManager();

  }


  // ── applyPatch ──────────────────────────────────────────────────────────────
  //
  // Apply every patch in `patchPlan` to the sandbox identified by `projectId`.
  //
  // @param {object}   input
  // @param {string}   input.projectId  - Target project
  // @param {object[]} input.patchPlan  - Array of patch entries (see action docs)
  //
  // @returns {Promise<object>} Result contract (see module header)

  async applyPatch(input = {}) {

    const { projectId, patchPlan } = input;


    // ── Validation ────────────────────────────────────────────────────────────

    if (!projectId) {
      return {
        success: false,
        error:   "projectId is required"
      };
    }

    if (!Array.isArray(patchPlan)) {
      return {
        success: false,
        error:   "patchPlan must be an array"
      };
    }

    const workspace = this._sandboxManager.get(projectId);

    if (!workspace) {
      return {
        success: false,
        error:   `No sandbox found for projectId: ${projectId}`
      };
    }

    const sandboxRoot = workspace.path;


    // ── Process each patch ────────────────────────────────────────────────────

    let applied = 0;
    let skipped = 0;
    const errors = [];

    for (let i = 0; i < patchPlan.length; i++) {

      const patch = patchPlan[i];

      // Validate individual patch entry
      if (!patch || typeof patch !== "object") {
        errors.push(`Patch [${i}]: not an object — skipped`);
        skipped++;
        continue;
      }

      const { action, path: filePath, content } = patch;

      if (!action) {
        errors.push(`Patch [${i}]: missing 'action' field — skipped`);
        skipped++;
        continue;
      }

      if (!SUPPORTED_ACTIONS.has(action)) {
        errors.push(
          `Patch [${i}]: unsupported action '${action}' — skipped`
        );
        skipped++;
        continue;
      }

      if (action !== "delete_file" && content === undefined) {
        errors.push(
          `Patch [${i}] (${action}): missing 'content' field — skipped`
        );
        skipped++;
        continue;
      }

      if (!filePath) {
        errors.push(`Patch [${i}] (${action}): missing 'path' field — skipped`);
        skipped++;
        continue;
      }

      // Resolve and security-check the target path
      let targetPath;
      try {
        targetPath = resolveSecure(sandboxRoot, filePath);
      } catch (secErr) {
        errors.push(`Patch [${i}] (${action}): ${secErr.message} — skipped`);
        skipped++;
        continue;
      }

      // Dispatch to action handler
      try {

        switch (action) {


          // ── replace_file ────────────────────────────────────────────────────

          case "replace_file": {
            await ensureDir(targetPath);
            await fs.writeFile(targetPath, content, "utf8");
            console.log(`PATCH EXECUTOR — replace_file: ${filePath}`);
            applied++;
            break;
          }


          // ── create_file ─────────────────────────────────────────────────────

          case "create_file": {
            await ensureDir(targetPath);
            await fs.writeFile(targetPath, content, "utf8");
            console.log(`PATCH EXECUTOR — create_file: ${filePath}`);
            applied++;
            break;
          }


          // ── delete_file ─────────────────────────────────────────────────────

          case "delete_file": {
            try {
              await fs.unlink(targetPath);
              console.log(`PATCH EXECUTOR — delete_file: ${filePath}`);
            } catch (unlinkErr) {
              if (unlinkErr.code === "ENOENT") {
                // File did not exist — treat as a no-op, not an error
                console.log(
                  `PATCH EXECUTOR — delete_file: ${filePath} (not found, skipping)`
                );
              } else {
                throw unlinkErr;
              }
            }
            applied++;
            break;
          }


          // ── append_file ─────────────────────────────────────────────────────

          case "append_file": {
            await ensureDir(targetPath);
            await fs.appendFile(targetPath, content, "utf8");
            console.log(`PATCH EXECUTOR — append_file: ${filePath}`);
            applied++;
            break;
          }


          // ── prepend_file ────────────────────────────────────────────────────

          case "prepend_file": {
            let existing = "";
            try {
              existing = await fs.readFile(targetPath, "utf8");
            } catch (readErr) {
              if (readErr.code !== "ENOENT") throw readErr;
              // File does not exist yet — prepend becomes a create
            }
            await ensureDir(targetPath);
            await fs.writeFile(targetPath, content + existing, "utf8");
            console.log(`PATCH EXECUTOR — prepend_file: ${filePath}`);
            applied++;
            break;
          }

        }

      } catch (patchErr) {

        const msg = patchErr instanceof Error
          ? patchErr.message
          : String(patchErr);

        errors.push(
          `Patch [${i}] (${action} → ${filePath}): ${msg}`
        );

        console.error(
          `PATCH EXECUTOR ERROR [${i}] ${action} ${filePath}:`,
          msg
        );

        skipped++;

      }

    }


    // ── Result ────────────────────────────────────────────────────────────────

    console.log(
      `PATCH EXECUTOR — Complete: applied=${applied} skipped=${skipped} errors=${errors.length}`
    );

    return {
      success:   true,
      projectId,
      applied,
      skipped,
      errors
    };

  }

}


export default PatchExecutor;
