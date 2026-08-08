// ── ANNEXE AI — Sandbox Workspace ────────────────────────────────────────────
//
// Creates an isolated filesystem workspace for a single project execution run.
//
// Responsibilities:
//   1. Validate { projectId, generatedFiles }
//   2. Create sandboxes/<projectId>/ on disk
//   3. Write each generated file into the workspace
//   4. Return workspace metadata
//
// Does NOT:
//   - Execute commands
//   - Install dependencies
//   - Call the execution worker
//   - Modify generated file content
//
// Phase 5.2: add cleanup / teardown support in a separate module.
//
// ─────────────────────────────────────────────────────────────────────────────

import fs   from "fs/promises";
import path from "path";


// ── Constants ─────────────────────────────────────────────────────────────────

const SANDBOX_ROOT = "sandboxes";


// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * resolveWorkspacePath
 *
 * Returns the absolute path for a project sandbox directory.
 *
 * @param  {string} projectId
 * @returns {string}
 */
function resolveWorkspacePath(projectId) {
  return path.resolve(SANDBOX_ROOT, projectId);
}


/**
 * writeFile
 *
 * Writes a single generated file into the workspace.
 * Creates intermediate directories automatically.
 *
 * @param {string} workspacePath - Absolute workspace root
 * @param {object} file          - { path: string, content: string }
 * @returns {Promise<string>}    - Resolved file path written
 */
async function writeFile(workspacePath, file) {

  const resolved = path.resolve(workspacePath, file.path);

  if (!resolved.startsWith(workspacePath)) {
    throw new Error("Invalid file path outside workspace");
  }

  const fileDir = path.dirname(resolved);

  await fs.mkdir(fileDir, { recursive: true });
  await fs.writeFile(resolved, file.content || "", "utf8");

  return resolved;

}


// ── Main export ───────────────────────────────────────────────────────────────

/**
 * createWorkspace
 *
 * Creates an isolated sandbox workspace for a project execution run.
 *
 * @param {object}   input
 * @param {string}   input.projectId      - Unique project identifier
 * @param {object[]} input.generatedFiles - Array of { path, content } file objects
 *
 * @returns {Promise<object>} Success or failure contract
 *
 * Success:
 * {
 *   success:   true,
 *   workspace: {
 *     id:           string,   // projectId
 *     path:         string,   // absolute workspace path
 *     filesCreated: number    // count of files written
 *   }
 * }
 *
 * Failure:
 * {
 *   success: false,
 *   error:   string
 * }
 */
export async function createWorkspace(input = {}) {

  const { projectId, generatedFiles } = input;


  // ── Validate input ──────────────────────────────────────────────────────

  if (!projectId) {
    return {
      success: false,
      error:   "projectId is required"
    };
  }

  if (!Array.isArray(generatedFiles) || generatedFiles.length === 0) {
    return {
      success: false,
      error:   "generatedFiles must be a non-empty array"
    };
  }


  // ── Resolve workspace path ──────────────────────────────────────────────

  const workspacePath = resolveWorkspacePath(projectId);


  try {

    // ── Create sandboxes/<projectId>/ ─────────────────────────────────────

    await fs.mkdir(workspacePath, { recursive: true });

    console.log(
      "ANNEXE WORKSPACE — Directory created:",
      workspacePath
    );


    // ── Write each generated file ─────────────────────────────────────────

    let filesCreated = 0;

    for (const file of generatedFiles) {

      if (!file?.path) {
        console.warn(
          "ANNEXE WORKSPACE — Skipping file with no path:",
          file
        );
        continue;
      }

      await writeFile(workspacePath, file);
      filesCreated++;

      console.log(
        "ANNEXE WORKSPACE — File written:",
        file.path
      );

    }


    // ── Return workspace metadata ─────────────────────────────────────────

    console.log(
      "ANNEXE WORKSPACE — Ready:",
      projectId,
      "| files:",
      filesCreated
    );

    return {
      success:   true,
      workspace: {
        id:           projectId,
        path:         workspacePath,
        filesCreated
      }
    };


  } catch (error) {

    console.error(
      "ANNEXE WORKSPACE — Creation failed:",
      projectId,
      error.message
    );

    return {
      success: false,
      error:   error.message || "Workspace creation failed"
    };

  }

}


export default createWorkspace;
