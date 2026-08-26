export default class CustomerInsightService {
  build(input = {}) {
    const company = input.company ?? {};
    const evolution = company.evolutionDepartment ?? {};
    const recommendations = evolution.recommendation?.prioritizedImprovements
      ?? evolution.roadmap?.immediateImprovements
      ?? [
        "AI Sales Assistant",
        "Predictive Analytics",
        "WhatsApp Automation"
      ];

    return {
      message: input.message ?? "Your AI company is working for you.",
      recommendations,
      reason: input.reason ?? "Based on current project status, reports, and evolution opportunities.",
      confidence: input.confidence ?? "High"
    };
  }
}
