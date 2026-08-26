export default class AiActivityService {
  build(input = {}) {
    const company = input.company ?? {};
    const stages = [
      { department: "CEO", status: "Strategizing", activeTasks: 1, completedTasks: 1 },
      { department: "Product", status: "Planning", activeTasks: 2, completedTasks: 1 },
      { department: "Architecture", status: "Designing", activeTasks: 2, completedTasks: 1 },
      { department: "Engineering", status: "Building", activeTasks: 4, completedTasks: 2 },
      { department: "QA", status: "Testing", activeTasks: 2, completedTasks: 1 },
      { department: "Security", status: "Auditing", activeTasks: 1, completedTasks: 1 },
      { department: "DevOps", status: "Deploying", activeTasks: 1, completedTasks: 1 }
    ];

    return {
      stages: stages.map(stage => ({
        ...stage,
        reportsGenerated: input.reportsGenerated?.[stage.department] ?? 1
      })),
      liveEvents: input.liveEvents ?? [
        "Architecture completed",
        "Engineering started module creation",
        "QA found issue",
        "Security approved release"
      ],
      totalActiveTasks: stages.reduce((sum, stage) => sum + stage.activeTasks, 0),
      totalCompletedTasks: stages.reduce((sum, stage) => sum + stage.completedTasks, 0),
      currentStatus: company.success ? "Operating" : "Planning"
    };
  }
}
