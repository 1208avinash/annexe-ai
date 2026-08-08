export function createFrontendEngineeringPlan(data = {}) {
  return {
    frontendId:       data.frontendId       || "FE-" + Date.now(),
    projectId:        data.projectId        || null,
    framework:        data.framework        || null,
    components:       data.components       || [],
    pages:            data.pages            || [],
    uiTasks:          data.uiTasks          || [],
    stateManagement:  data.stateManagement  || [],
    apiIntegration:   data.apiIntegration   || [],
    testingPlan:      data.testingPlan      || [],
    estimatedTasks:   data.estimatedTasks   || [],
    createdAt:        data.createdAt        || new Date().toISOString()
  };
}