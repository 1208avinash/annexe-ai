// ── ANNEXE AI — Sandbox Cleanup ──────────────────────────────────────────────
//
// Safely removes a sandbox workspace directory after execution completes.
//
// Responsibilities:
//   1. Validate { projectId }
//   2. Resolve sandboxes/<projectId> to an absolute path
//   3. Confirm the resolved path stays inside the sandbox root (path traversal guard)
//   4. Remove the directory recursively
//
// Does NOT:
//   - Create workspaces (workspace.js)
//   - Track workspace metadata (manager.js)
//   - Execute commands (runner.js / command-runner.js)
//   - Call the execution worker
//
// ─────────────────────────────────────────────────────────────────────────────

import fs   from "fs/promises";
import path from "path";


// ── Constants ─────────────────────────────────────────────────────────────────

const SANDBOX_ROOT = path.resolve("sandboxes");


// ── cleanupWorkspace ──────────────────────────────────────────────────────────

/**
 * Removes the sandbox workspace directory for a project.
 *
 * @param {object} input
 * @param {string} input.projectId - Unique project identifier
 *
 * @returns {Promise<object>} Success or failure contract
 *
 * Success:
 * {
 *   success:   true,
 *   projectId: string,
 *   removed:   true
 * }
 *
 * Failure:
 * {
 *   success: false,
 *   error:   string
 * }
 */
export async function cleanupWorkspace(input = {}) {

  const { projectId } = input;


  // ── 1. Validate projectId ─────────────────────────────────────────────────

  if (!projectId || typeof projectId !== "string" || projectId.trim() === "") {
    return {
      success: false,
      error:   "projectId is required"
    };
  }


  // ── 2. Resolve absolute workspace path ────────────────────────────────────

  const workspacePath = path.resolve(SANDBOX_ROOT, projectId);


  // ── 3. Path traversal guard ───────────────────────────────────────────────
  //
  // Ensure the resolved path is strictly inside SANDBOX_ROOT.
  // Rejects:  ../escape, /absolute/outside, empty-after-trim ids, etc.

  if (!workspacePath.startsWith(SANDBOX_ROOT + path.sep) &&
       workspacePath !== SANDBOX_ROOT) {
    return {
      success: false,
      error:   `Unsafe path rejected: "${workspacePath}" is outside sandbox root`
    };
  }

  // Extra guard: resolved path must not equal the root itself
  if (workspacePath === SANDBOX_ROOT) {
    return {
      success: false,
      error:   "Refusing to remove sandbox root directory"
    };
  }


  // ── 4. Remove directory recursively ──────────────────────────────────────

  try {

    await fs.rm(workspacePath, { recursive: true, force: true });

    console.log(
      "ANNEXE SANDBOX CLEANUP — Removed:",
      workspacePath
    );

    return {
      success:   true,
      projectId,
      removed:   true
    };

  } catch (error) {

    console.error(
      "ANNEXE SANDBOX CLEANUP — Failed:",
      workspacePath,
      error.message
    );

    return {
      success: false,
      error:   error.message || "Workspace removal failed"
    };

  }

}


export default cleanupWorkspace;
