// ── ANNEXE AI — Sandbox Manager ──────────────────────────────────────────────
//
// Provides isolated workspace metadata for coding agents.
// Foundation layer — Docker/container execution plugged in later via adapter.
//
// ─────────────────────────────────────────────────────────────────────────────

import { validateSandboxTransition, STATUSES } from "./lifecycle.js";
import { validateSandbox }                      from "./validator.js";


// ── Storage abstraction ───────────────────────────────────────────────────────
//
// In-memory now. Swap createStorageAdapter() for Postgres/Redis later
// without touching SandboxManager.

function createStorageAdapter() {

  const store = new Map();

  return {

    set(id, sandbox) {
      store.set(id, { ...sandbox });
    },

    get(id) {
      const s = store.get(id);
      return s ? { ...s } : null;
    },

    findByProject(projectId) {
      for (const sandbox of store.values()) {
        if (sandbox.projectId === projectId) return { ...sandbox };
      }
      return null;
    },

    update(id, patch) {
      const existing = store.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...patch };
      store.set(id, updated);
      return { ...updated };
    },

    delete(id) {
      return store.delete(id);
    }

  };

}


// ── Counter for unique sandbox IDs ────────────────────────────────────────────

let _counter = 1;

function nextId(projectId) {
  const seq = String(_counter++).padStart(4, "0");
  return `SANDBOX-${projectId}-${seq}`;
}


// ── SandboxManager ────────────────────────────────────────────────────────────

export class SandboxManager {

  constructor() {
    this._storage = createStorageAdapter();
  }


  // ── createSandbox ───────────────────────────────────────────────────────────

  createSandbox(projectId) {

    if (!projectId) {
      throw new Error("projectId is required");
    }

    const id = nextId(projectId);

    const sandbox = {
      id,
      projectId,
      path:      `sandbox/${projectId}`,
      status:    STATUSES.CREATED,
      createdAt: new Date().toISOString(),
      destroyAt: null
    };

    const { valid, errors } = validateSandbox(sandbox);

    if (!valid) {
      throw new Error(`Invalid sandbox: ${errors.join(", ")}`);
    }

    this._storage.set(id, sandbox);

    console.log(`SANDBOX CREATED: ${id}`);

    return { ...sandbox };

  }


  // ── getSandbox ──────────────────────────────────────────────────────────────

  getSandbox(projectId) {

    const sandbox = this._storage.findByProject(projectId);

    if (!sandbox) return null;

    return { ...sandbox };

  }


  // ── getSandboxById ──────────────────────────────────────────────────────────

  getSandboxById(id) {

    return this._storage.get(id);

  }


  // ── activateSandbox ─────────────────────────────────────────────────────────
  //
  // Walks CREATED → INITIALIZING → READY in two transitions.

  activateSandbox(id) {

    let sandbox = this._storage.get(id);

    if (!sandbox) {
      throw new Error(`Sandbox not found: ${id}`);
    }

    // CREATED → INITIALIZING
    if (!validateSandboxTransition(sandbox.status, STATUSES.INITIALIZING)) {
      throw new Error(
        `Cannot transition from ${sandbox.status} to ${STATUSES.INITIALIZING}`
      );
    }

    sandbox = this._storage.update(id, { status: STATUSES.INITIALIZING });
    console.log(`SANDBOX INITIALIZING: ${id}`);

    // INITIALIZING → READY
    if (!validateSandboxTransition(sandbox.status, STATUSES.READY)) {
      throw new Error(
        `Cannot transition from ${sandbox.status} to ${STATUSES.READY}`
      );
    }

    sandbox = this._storage.update(id, { status: STATUSES.READY });
    console.log(`SANDBOX READY: ${id}`);

    return { ...sandbox };

  }


  // ── lockSandbox ─────────────────────────────────────────────────────────────

  lockSandbox(id) {

    const sandbox = this._storage.get(id);

    if (!sandbox) {
      throw new Error(`Sandbox not found: ${id}`);
    }

    if (!validateSandboxTransition(sandbox.status, STATUSES.LOCKED)) {
      throw new Error(
        `Cannot lock sandbox from status: ${sandbox.status}`
      );
    }

    const updated = this._storage.update(id, { status: STATUSES.LOCKED });
    console.log(`SANDBOX LOCKED: ${id}`);

    return { ...updated };

  }


  // ── destroySandbox ──────────────────────────────────────────────────────────

  destroySandbox(id) {

    const sandbox = this._storage.get(id);

    if (!sandbox) {
      throw new Error(`Sandbox not found: ${id}`);
    }

    if (!validateSandboxTransition(sandbox.status, STATUSES.DESTROYED)) {
      throw new Error(
        `Cannot destroy sandbox from status: ${sandbox.status}`
      );
    }

    const updated = this._storage.update(id, {
      status:    STATUSES.DESTROYED,
      destroyAt: new Date().toISOString()
    });

    console.log(`SANDBOX DESTROYED: ${id}`);

    return { ...updated };

  }

}


// ── Singleton export (matches existing agent pattern) ─────────────────────────

export const sandboxManager = new SandboxManager();


// ── HTTP handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { action, projectId, sandboxId } = req.body || {};

    if (!action) {
      return res.status(400).json({ error: "Action required" });
    }

    let result;

    switch (action) {

      case "create":
        result = sandboxManager.createSandbox(projectId);
        break;

      case "get":
        result = sandboxManager.getSandbox(projectId);
        break;

      case "activate":
        result = sandboxManager.activateSandbox(sandboxId);
        break;

      case "lock":
        result = sandboxManager.lockSandbox(sandboxId);
        break;

      case "destroy":
        result = sandboxManager.destroySandbox(sandboxId);
        break;

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });

    }

    return res.status(200).json({ success: true, sandbox: result });

  } catch (error) {

    console.error("SANDBOX MANAGER ERROR:", error);

    return res.status(500).json({ error: error.message || "Sandbox operation failed" });

  }

}
