export function createProjectSchema(data = {}) {

  const now = new Date().toISOString();

  return {

    projectId:
      data.projectId || "ANNEXE-" + Date.now(),

    clientName:
      data.clientName || "Unknown",

    companyName:
      data.companyName || "Unknown",

    industry:
      data.industry || "Not defined",

    challenge:
      data.challenge || "Not defined",

    solution:
      data.solution || "Not defined",

    blueprint:
      data.blueprint || {},


    requirements:
      data.requirements || null,

    technology:
      data.technology || null,

    architecture:
      data.architecture || null,

    developmentPlan:
      data.developmentPlan || null,


    estimation:
      data.estimation || null,

    proposal:
      data.proposal || null,

    paymentGate:
      data.paymentGate || null,


    status:
      data.status || "analysis",


    currentAgent:
      data.currentAgent || "requirement_agent",


    createdAt:
      now,

    updatedAt:
      now
  };
}