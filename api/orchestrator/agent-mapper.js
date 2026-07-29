// ── PATCH FOR api/orchestrator/agent-mapper.js ───────────────────────────────
//
// WHY: test-debug-worker.js Section 6 imports { getAgentRoute } and asserts:
//   getAgentRoute("debug_worker") === "/api/agents/debug/worker"
//   getAgentRoute("nonexistent")  === null
//
// The uploaded agent-mapper.js does not export getAgentRoute.
// It exports runAgentAdapter (which is actually agent-adapters content).
//
// ACTION: Add getAgentRoute and the ROUTE_MAP at the END of agent-mapper.js.
// Do NOT remove runAgentAdapter or any existing exports.
// ─────────────────────────────────────────────────────────────────────────────

// ── Route map ─────────────────────────────────────────────────────────────────
//
// Maps worker id → HTTP route path.
// Used by orchestrator engine to dispatch tasks to the right agent endpoint.

const ROUTE_MAP = new Map([
  ["debug_worker",      "/api/agents/debug/worker"],
  ["generation_worker", "/api/agents/generation/worker"],
  ["repository_worker", "/api/agents/repository/worker"],
  ["build_worker",      "/api/agents/build/worker"],
  ["delivery_worker",   "/api/agents/delivery/worker"],
  ["backend_worker",    "/api/agents/backend/worker"],
  ["frontend_worker",   "/api/agents/frontend/worker"]
]);


/**
 * getAgentRoute
 *
 * Returns the HTTP route path for a given worker id.
 * Returns null if the worker is not registered.
 *
 * @param  {string} workerId
 * @returns {string|null}
 */
export function getAgentRoute(workerId) {
  return ROUTE_MAP.get(workerId) || null;
}
