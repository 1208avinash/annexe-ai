export default class CustomerIntakeService {
    capture(input = {}) {
        const company = input.company ?? {};
        const analysis = company.analysis ?? {};
        const profile = {
            customerName: analysis.projectName ?? "Customer",
            companyName: analysis.projectName ?? "Customer Company",
            industry: analysis.industry ?? "Business",
            projectId: analysis.projectId ?? null,
            projectType: analysis.applicationType ?? "crm"
        };

        return {
            profile,
            journey: [
                "Visitor",
                "Create Account",
                "Describe Business Idea",
                "AI Questionnaire",
                "AI Business Analysis",
                "AI Proposal"
            ]
        };
    }
}
