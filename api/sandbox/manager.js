// ── ANNEXE AI — Sandbox Manager ──────────────────────────────────────────────
//
// Lifecycle manager for sandbox workspaces.
// Sits above workspace.js — calls createWorkspace() and tracks the result
// in an in-memory Map keyed by projectId.
//
// Does NOT:
//   - Execute commands
//   - Call command-runner
//   - Connect the execution worker
//   - Touch the filesystem directly (delegated to workspace.js)
//
// Phase 5.3: add cleanup.js for filesystem teardown on remove().
//
// ─────────────────────────────────────────────────────────────────────────────

import { createWorkspace } from "./workspace.js";


// ── SandboxManager ────────────────────────────────────────────────────────────

export class SandboxManager {

  constructor() {

    // In-memory store: projectId → workspace metadata
    this._store = new Map();

  }


  // ── create ──────────────────────────────────────────────────────────────────
  //
  // Creates a sandbox workspace for a project and stores the metadata.
  //
  // @param {object}   input
  // @param {string}   input.projectId      - Unique project identifier
  // @param {object[]} input.generatedFiles - Array of { path, content } objects
  //
  // @returns {Promise<object>} createWorkspace() result (success or failure)
  //
  // On success the workspace metadata is stored under input.projectId.
  // On failure nothing is stored and the failure contract is returned as-is.

  async create(input = {}) {

    const result = await createWorkspace(input);

    if (result.success) {

      this._store.set(input.projectId, result.workspace);

      console.log(
        "ANNEXE SANDBOX MANAGER — Workspace stored:",
        input.projectId
      );

    } else {

      console.warn(
        "ANNEXE SANDBOX MANAGER — Workspace creation failed, not stored:",
        input.projectId,
        result.error
      );

    }

    return result;

  }


  // ── get ─────────────────────────────────────────────────────────────────────
  //
  // Returns the stored workspace metadata for a project.
  // Returns null if no workspace has been created for the given projectId.
  //
  // @param  {string} projectId
  // @returns {{ id: string, path: string, filesCreated: number }|null}

  get(projectId) {

    return this._store.get(projectId) || null;

  }


  // ── remove ──────────────────────────────────────────────────────────────────
  //
  // Removes the workspace metadata entry from the in-memory store.
  // Does NOT delete the filesystem directory (reserved for cleanup.js).
  //
  // @param  {string} projectId
  // @returns {{ success: boolean, projectId: string }}

  remove(projectId) {

    const existed = this._store.has(projectId);

    this._store.delete(projectId);

    if (existed) {
      console.log(
        "ANNEXE SANDBOX MANAGER — Workspace removed:",
        projectId
      );
    } else {
      console.warn(
        "ANNEXE SANDBOX MANAGER — Remove called for unknown projectId:",
        projectId
      );
    }

    return {
      success:   true,
      projectId
    };

  }

}


export default SandboxManager;
