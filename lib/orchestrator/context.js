// ── ANNEXE AI — Project Context Manager ──────────────────────────────────────
//
// Holds shared project state that flows between agent adapters.
// Each agent reads from context, runs, then writes its output back.
//
// Adapter flow:
//   architect_worker  → addArchitecture()
//   backend_worker    → addBackendPlan()
//   frontend_worker   → addFrontendPlan()      ← added in this patch
//   testing_worker    → addTests()
//   review_worker     → addReviews()
//
// ─────────────────────────────────────────────────────────────────────────────


class ProjectContextManager {

  constructor() {
    // In-memory store: projectId → context object
    this.contexts = new Map();
  }


  // ── Create ──────────────────────────────────────────────────────────────────

  create(projectId) {

    const ctx = {
      projectId,

      // Agent outputs — populated as the pipeline progresses
      architecture: null,   // set by architect_worker
      backendPlan:  null,   // set by backend_worker
      frontendPlan: null,   // set by frontend_worker  ← new field
      files:        [],     // set by developer_worker (future)
      tests:        [],     // set by testing_worker
      reviews:      [],     // set by review_worker

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.contexts.set(projectId, ctx);

    console.log(`[ProjectContextManager] Context created: ${projectId}`);

    return ctx;

  }


  // ── Get ─────────────────────────────────────────────────────────────────────

  get(projectId) {

    if (!this.contexts.has(projectId)) {
      // Auto-create so adapters never crash on a missing context
      return this.create(projectId);
    }

    return this.contexts.get(projectId);

  }


  // ── Generic update ───────────────────────────────────────────────────────────

  update(projectId, patch) {

    const ctx = this.get(projectId);

    Object.assign(ctx, patch, {
      updatedAt: new Date().toISOString()
    });

    this.contexts.set(projectId, ctx);

    return ctx;

  }


  // ── addArchitecture ──────────────────────────────────────────────────────────
  //
  // Called by architect_worker after the architect agent succeeds.

  addArchitecture(projectId, architecture) {

    const ctx = this.get(projectId);

    ctx.architecture = architecture;
    ctx.updatedAt    = new Date().toISOString();

    this.contexts.set(projectId, ctx);

    console.log(`[ProjectContextManager] Architecture stored: ${projectId}`);

    return ctx;

  }


  // ── addBackendPlan ───────────────────────────────────────────────────────────
  //
  // Called by backend_worker after the backend engineer agent succeeds.
  // Stores the full backendPlan so the frontend adapter can read it.

  addBackendPlan(projectId, backendPlan) {

    const ctx = this.get(projectId);

    ctx.backendPlan = backendPlan;
    ctx.updatedAt   = new Date().toISOString();

    this.contexts.set(projectId, ctx);

    console.log(`[ProjectContextManager] Backend plan stored: ${projectId}`);

    return ctx;

  }


  // ── addFrontendPlan ──────────────────────────────────────────────────────────
  //
  // Called by frontend_worker after the frontend engineer agent succeeds.
  // Stores the full frontendPlan so testing and review adapters can read it.

  addFrontendPlan(projectId, frontendPlan) {

    const ctx = this.get(projectId);

    ctx.frontendPlan = frontendPlan;
    ctx.updatedAt    = new Date().toISOString();

    this.contexts.set(projectId, ctx);

    console.log(`[ProjectContextManager] Frontend plan stored: ${projectId}`);

    return ctx;

  }


  // ── addFiles ─────────────────────────────────────────────────────────────────
  //
  // Called by developer_worker (future stage).

  addFiles(projectId, files = []) {

    const ctx = this.get(projectId);

    ctx.files     = [...(ctx.files || []), ...files];
    ctx.updatedAt = new Date().toISOString();

    this.contexts.set(projectId, ctx);

    console.log(`[ProjectContextManager] Files added: ${projectId} (+${files.length})`);

    return ctx;

  }


  // ── addTests ─────────────────────────────────────────────────────────────────

  addTests(projectId, tests = []) {

    const ctx = this.get(projectId);

    ctx.tests     = [...(ctx.tests || []), ...tests];
    ctx.updatedAt = new Date().toISOString();

    this.contexts.set(projectId, ctx);

    console.log(`[ProjectContextManager] Tests added: ${projectId} (+${tests.length})`);

    return ctx;

  }


  // ── addReviews ───────────────────────────────────────────────────────────────

  addReviews(projectId, reviews = []) {

    const ctx = this.get(projectId);

    ctx.reviews   = [...(ctx.reviews || []), ...reviews];
    ctx.updatedAt = new Date().toISOString();

    this.contexts.set(projectId, ctx);

    console.log(`[ProjectContextManager] Reviews added: ${projectId} (+${reviews.length})`);

    return ctx;

  }


  // ── has ──────────────────────────────────────────────────────────────────────

  has(projectId) {
    return this.contexts.has(projectId);
  }


  // ── delete ───────────────────────────────────────────────────────────────────

  delete(projectId) {
    this.contexts.delete(projectId);
  }

}


// ── Singleton export ──────────────────────────────────────────────────────────
//
// All adapters import the same instance so context is shared across the pipeline.

export const projectContextManager = new ProjectContextManager();

export default ProjectContextManager;
