export default class AiCeoResponseService {
  answer(question, context = {}) {
    const projectName = context.projectDashboard?.projectName ?? "your project";
    const currentDepartment = context.projectDashboard?.currentDepartment ?? "CEO";
    const estimatedCompletion = context.projectDashboard?.timeline?.estimatedCompletion ?? "Pending";
    const recommendations = context.customerInsight?.recommendations ?? [];

    const lowerQuestion = String(question ?? "").toLowerCase();

    if (lowerQuestion.includes("what is happening")) {
      return `Your AI company is actively progressing ${projectName}. The current department is ${currentDepartment}, and the project is tracking toward ${estimatedCompletion}.`;
    }

    if (lowerQuestion.includes("when will my project finish")) {
      return `The current timeline indicates ${estimatedCompletion} for ${projectName}.`;
    }

    if (lowerQuestion.includes("what improvements do you recommend")) {
      return `Recommended improvements: ${recommendations.slice(0, 3).join(", ")}.`;
    }

    if (lowerQuestion.includes("why did this decision happen")) {
      return `The decision was made using current project status, department reports, and evolution recommendations for ${projectName}.`;
    }

    return `Your AI company is working on ${projectName}. Current status: ${currentDepartment}, expected completion: ${estimatedCompletion}.`;
  }
}
