export default class ProjectDashboardService {
  build(input = {}) {
    const company = input.company ?? {};
    const production = input.productionPlatform ?? {};
    const project = production.project ?? company.project ?? {};
    const timeline = input.timeline ?? {
      startedAt: company.generation?.generatedAt ?? new Date().toISOString(),
      estimatedCompletion: company.tracking?.projectOverview?.estimatedCompletion ?? "Pending",
      phases: [
        "AI CEO",
        "Product",
        "Architecture",
        "Engineering",
        "QA",
        "Security",
        "Deployment"
      ]
    };

    return {
      projectName: project.name ?? company.analysis?.projectName ?? "ANNEXE Project",
      projectId: project.id ?? company.analysis?.projectId ?? null,
      progress: company.tracking?.projectOverview?.progress ?? 0,
      currentDepartment: company.tracking?.projectOverview?.currentDepartment ?? "CEO",
      timeline,
      milestones: input.milestones ?? [
        { title: "Project approved", status: "complete" },
        { title: "Foundation generated", status: "complete" },
        { title: "Execution in progress", status: "active" }
      ],
      blockers: input.blockers ?? [],
      nextAction: input.nextAction ?? "Monitor live AI company activity"
    };
  }
}
