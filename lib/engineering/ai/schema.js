export function createAIEngineeringPlan(data = {}) {
  return {
    aiId:            data.aiId            || "AI-" + Date.now(),
    projectId:       data.projectId       || null,
    aiArchitecture:  data.aiArchitecture  || [],
    models:          data.models          || [],
    workflows:       data.workflows       || [],
    prompts:         data.prompts         || [],
    integrations:    data.integrations    || [],
    dataPipeline:    data.dataPipeline    || [],
    evaluationPlan:  data.evaluationPlan  || [],
    securityPlan:    data.securityPlan    || [],
    testingPlan:     data.testingPlan     || [],
    estimatedTasks:  data.estimatedTasks  || [],
    createdAt:       data.createdAt       || new Date().toISOString()
  };
}