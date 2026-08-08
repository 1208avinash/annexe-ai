/*
  ANNEXE AI — Autonomous Orchestrator
  FILE: api/orchestrator/state.js

  ProjectStateManager
  Tracks project lifecycle state and transition history.
  In-memory only. No database. No external dependencies.
*/


/*
  Valid project states in lifecycle order
*/

export const PROJECT_STATES = [
  "CREATED",
  "ANALYSIS",
  "ARCHITECTURE_READY",
  "TASKS_CREATED",
  "CODING",
  "TESTING",
  "REVIEW",
  "APPROVAL_REQUIRED",
  "DELIVERED",
  "FAILED"
];


/*
  Allowed state transitions map
  Key: current state → Value: allowed next states
*/

const TRANSITIONS = {
  CREATED:           ["ANALYSIS",          "FAILED"],
  ANALYSIS:          ["ARCHITECTURE_READY","FAILED"],
  ARCHITECTURE_READY:["TASKS_CREATED",     "FAILED"],
  TASKS_CREATED:     ["CODING",            "FAILED"],
  CODING:            ["TESTING",           "FAILED"],
  TESTING:           ["REVIEW",            "FAILED"],
  REVIEW:            ["APPROVAL_REQUIRED", "DELIVERED", "FAILED"],
  APPROVAL_REQUIRED: ["DELIVERED",         "FAILED"],
  DELIVERED:         [],
  FAILED:            []
};


/*
  In-memory stores
*/

const stateStore   = new Map(); // projectId → { projectId, state }
const historyStore = new Map(); // projectId → [{ from, to, at }]


/*
  ProjectStateManager

  Creates and manages project lifecycle state.
*/

export class ProjectStateManager {


  /*
    createProjectState(projectId)

    Initialises a new project in CREATED state.
    Returns: { projectId, state }
  */

  createProjectState(projectId) {

    if (!projectId) {
      return {
        success: false,
        error:   "projectId is required"
      };
    }

    if (stateStore.has(projectId)) {
      return {
        success: false,
        error:   `Project '${projectId}' already exists`
      };
    }

    const entry = {
      projectId,
      state:     "CREATED",
      createdAt: new Date().toISOString()
    };

    stateStore.set(projectId, entry);
    historyStore.set(projectId, []);

    console.log(
      "ANNEXE STATE MANAGER — Project created:",
      projectId
    );

    return {
      projectId,
      state: "CREATED"
    };

  }


  /*
    updateState(projectId, newState)

    Transitions a project to a new state.
    Validates the transition before applying.
    Returns: { success, projectId, state }
  */

  updateState(projectId, newState) {

    if (!stateStore.has(projectId)) {
      return {
        success: false,
        error:   `Project '${projectId}' not found`
      };
    }

    if (!PROJECT_STATES.includes(newState)) {
      return {
        success: false,
        error:   `Unknown state '${newState}'`
      };
    }

    const current     = stateStore.get(projectId);
    const allowed     = TRANSITIONS[current.state] || [];

    if (!allowed.includes(newState)) {
      return {
        success: false,
        error:   `Invalid transition: ${current.state} → ${newState}`
      };
    }

    // Record history entry
    const historyEntry = {
      from:      current.state,
      to:        newState,
      updatedAt: new Date().toISOString()
    };

    historyStore.get(projectId).push(historyEntry);

    // Apply transition
    current.state     = newState;
    current.updatedAt = historyEntry.updatedAt;

    console.log(
      "ANNEXE STATE MANAGER — Transition:",
      projectId,
      historyEntry.from,
      "→",
      newState
    );

    return {
      success:   true,
      projectId,
      state:     newState
    };

  }


  /*
    getState(projectId)

    Returns the current state entry for a project.
  */

  getState(projectId) {

    return stateStore.get(projectId) || null;

  }


  /*
    getHistory(projectId)

    Returns the full transition history for a project.
  */

  getHistory(projectId) {

    return historyStore.get(projectId) || [];

  }

}
