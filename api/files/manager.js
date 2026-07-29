// ── ANNEXE AI — File Operation Manager ───────────────────────────────────────
//
// The ONLY layer permitted to read/write files within a sandbox.
// All operations are validated, permission-checked, and audit-logged.
//
// Storage is in-memory now; swap createStorageAdapter() for PostgreSQL later.
//
// ─────────────────────────────────────────────────────────────────────────────

import { FILE_OPERATIONS }         from "./operations.js";
import { validatePath,
         validateAgentFileAccess } from "./security.js";
import { validateFileRequest }     from "./validator.js";


// ── Storage abstraction ───────────────────────────────────────────────────────
//
// fileStore  — { "<sandboxId>:<filePath>" : { content, createdAt, updatedAt } }
// auditStore — flat array of operation log entries

function createStorageAdapter() {

  const fileStore  = new Map();
  const auditStore = [];

  return {

    // ── File store ──────────────────────────────────────────────────────────

    fileKey(sandboxId, filePath) {
      return `${sandboxId}:${filePath}`;
    },

    fileExists(sandboxId, filePath) {
      return fileStore.has(this.fileKey(sandboxId, filePath));
    },

    getFile(sandboxId, filePath) {
      const record = fileStore.get(this.fileKey(sandboxId, filePath));
      return record ? { ...record } : null;
    },

    setFile(sandboxId, filePath, content) {
      const now = new Date().toISOString();
      const key = this.fileKey(sandboxId, filePath);
      const existing = fileStore.get(key);
      fileStore.set(key, {
        sandboxId,
        filePath,
        content,
        createdAt: existing?.createdAt || now,
        updatedAt: now
      });
    },

    deleteFile(sandboxId, filePath) {
      return fileStore.delete(this.fileKey(sandboxId, filePath));
    },

    listFiles(sandboxId) {
      const results = [];
      for (const record of fileStore.values()) {
        if (record.sandboxId === sandboxId) {
          results.push({
            filePath:  record.filePath,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
          });
        }
      }
      return results;
    },

    // ── Audit store ─────────────────────────────────────────────────────────

    appendAudit(entry) {
      auditStore.push({ ...entry });
    },

    getAuditLogs() {
      return [...auditStore];
    }

  };

}


// ── Audit entry factory ───────────────────────────────────────────────────────

let _auditSeq = 1;

function createAuditEntry({ sandboxId, agent, operation, filePath, status, meta = {} }) {
  return {
    id:        `AUDIT-${Date.now()}-${_auditSeq++}`,
    sandboxId,
    agent,
    operation,
    filePath,
    status,
    meta,
    createdAt: new Date().toISOString()
  };
}


// ── FileOperationManager ──────────────────────────────────────────────────────

export class FileOperationManager {

  constructor() {
    this._storage = createStorageAdapter();
  }


  // ── Internal helpers ────────────────────────────────────────────────────────

  // Returns { ok: true } on success, or { ok: false, error, reason } on failure.
  // Never throws — callers decide how to surface the result.
  _validateAndAuthorise(request) {

    // 1. Request shape
    const { valid, errors } = validateFileRequest(request);
    if (!valid) {
      return {
        ok:     false,
        error:  "Invalid request",
        reason: errors.join("; ")
      };
    }

    // 2. Path safety
    const { valid: pathOk, error: pathErr } = validatePath(request.filePath);
    if (!pathOk) {
      return {
        ok:     false,
        error:  "Permission denied",
        reason: `Path security violation: ${pathErr}`
      };
    }

    // 3. Agent permission
    const { allowed, reason } = validateAgentFileAccess(request.agent, request.filePath);
    if (!allowed) {
      return {
        ok:     false,
        error:  "Permission denied",
        reason
      };
    }

    return { ok: true };

  }

  // Builds a controlled DENIED response and writes a DENIED audit entry.
  _deny(operation, sandboxId, agent, filePath, error, reason) {
    console.warn(`FILE ${operation} DENIED: [${sandboxId}] ${filePath} by ${agent} — ${reason}`);
    this._audit(sandboxId, agent, operation, filePath, "DENIED", { error, reason });
    return {
      success:   false,
      operation,
      filePath,
      error,
      reason
    };
  }

  _audit(sandboxId, agent, operation, filePath, status, meta = {}) {
    const entry = createAuditEntry({ sandboxId, agent, operation, filePath, status, meta });
    this._storage.appendAudit(entry);
    return entry;
  }


  // ── createFile ──────────────────────────────────────────────────────────────

  createFile(request) {

    const { sandboxId, agent, filePath, content } = request;

    const auth = this._validateAndAuthorise({ ...request, operation: FILE_OPERATIONS.CREATE });
    if (!auth.ok) {
      return this._deny(FILE_OPERATIONS.CREATE, sandboxId, agent, filePath, auth.error, auth.reason);
    }

    if (this._storage.fileExists(sandboxId, filePath)) {
      throw new Error(`File already exists: ${filePath}`);
    }

    this._storage.setFile(sandboxId, filePath, content);

    this._audit(sandboxId, agent, FILE_OPERATIONS.CREATE, filePath, "SUCCESS");

    console.log(`FILE CREATED: [${sandboxId}] ${filePath} by ${agent}`);

    return {
      success:   true,
      operation: FILE_OPERATIONS.CREATE,
      filePath,
      sandboxId
    };

  }


  // ── readFile ────────────────────────────────────────────────────────────────

  readFile(request) {

    const { sandboxId, agent, filePath } = request;

    const auth = this._validateAndAuthorise({ ...request, operation: FILE_OPERATIONS.READ });
    if (!auth.ok) {
      return this._deny(FILE_OPERATIONS.READ, sandboxId, agent, filePath, auth.error, auth.reason);
    }

    const record = this._storage.getFile(sandboxId, filePath);

    if (!record) {
      throw new Error(`File not found: ${filePath}`);
    }

    this._audit(sandboxId, agent, FILE_OPERATIONS.READ, filePath, "SUCCESS");

    return {
      success:   true,
      operation: FILE_OPERATIONS.READ,
      filePath,
      content:   record.content,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };

  }


  // ── updateFile ──────────────────────────────────────────────────────────────

  updateFile(request) {

    const { sandboxId, agent, filePath, content } = request;

    const auth = this._validateAndAuthorise({ ...request, operation: FILE_OPERATIONS.UPDATE });
    if (!auth.ok) {
      return this._deny(FILE_OPERATIONS.UPDATE, sandboxId, agent, filePath, auth.error, auth.reason);
    }

    const existing = this._storage.getFile(sandboxId, filePath);

    if (!existing) {
      throw new Error(`File not found: ${filePath}`);
    }

    const oldContent = existing.content;

    this._storage.setFile(sandboxId, filePath, content);

    this._audit(sandboxId, agent, FILE_OPERATIONS.UPDATE, filePath, "SUCCESS", {
      oldContent,
      newContent: content
    });

    console.log(`FILE UPDATED: [${sandboxId}] ${filePath} by ${agent}`);

    return {
      success:          true,
      operation:        FILE_OPERATIONS.UPDATE,
      filePath,
      sandboxId,
      oldContentStored: true
    };

  }


  // ── deleteFile ──────────────────────────────────────────────────────────────

  deleteFile(request) {

    const { sandboxId, agent, filePath } = request;

    const auth = this._validateAndAuthorise({ ...request, operation: FILE_OPERATIONS.DELETE });
    if (!auth.ok) {
      return this._deny(FILE_OPERATIONS.DELETE, sandboxId, agent, filePath, auth.error, auth.reason);
    }

    const existing = this._storage.getFile(sandboxId, filePath);

    if (!existing) {
      throw new Error(`File not found: ${filePath}`);
    }

    this._storage.deleteFile(sandboxId, filePath);

    this._audit(sandboxId, agent, FILE_OPERATIONS.DELETE, filePath, "SUCCESS");

    console.log(`FILE DELETED: [${sandboxId}] ${filePath} by ${agent}`);

    return {
      success:   true,
      operation: FILE_OPERATIONS.DELETE,
      filePath,
      sandboxId
    };

  }


  // ── listFiles ───────────────────────────────────────────────────────────────

  listFiles(request) {

    const { sandboxId, agent } = request || {};

    if (!sandboxId) {
      throw new Error("sandboxId is required for LIST");
    }

    this._audit(sandboxId, agent || "system", FILE_OPERATIONS.LIST, "/", "SUCCESS");

    const files = this._storage.listFiles(sandboxId);

    return {
      success:   true,
      operation: FILE_OPERATIONS.LIST,
      sandboxId,
      files
    };

  }


  // ── getAuditLogs ────────────────────────────────────────────────────────────

  getAuditLogs() {
    return this._storage.getAuditLogs();
  }

}


// ── Singleton export ──────────────────────────────────────────────────────────

export const fileOperationManager = new FileOperationManager();


// ── HTTP handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { operation, ...rest } = req.body || {};

    if (!operation) {
      return res.status(400).json({ error: "operation is required" });
    }

    let result;

    switch (operation) {

      case FILE_OPERATIONS.CREATE:
        result = fileOperationManager.createFile({ operation, ...rest });
        break;

      case FILE_OPERATIONS.READ:
        result = fileOperationManager.readFile({ operation, ...rest });
        break;

      case FILE_OPERATIONS.UPDATE:
        result = fileOperationManager.updateFile({ operation, ...rest });
        break;

      case FILE_OPERATIONS.DELETE:
        result = fileOperationManager.deleteFile({ operation, ...rest });
        break;

      case FILE_OPERATIONS.LIST:
        result = fileOperationManager.listFiles({ operation, ...rest });
        break;

      default:
        return res.status(400).json({ error: `Unknown operation: ${operation}` });

    }

    return res.status(200).json(result);

  } catch (error) {

    console.error("FILE OPERATION MANAGER ERROR:", error.message);

    return res.status(500).json({ error: error.message || "File operation failed" });

  }

}
