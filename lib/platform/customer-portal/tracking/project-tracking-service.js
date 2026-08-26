export default class ProjectTrackingService {
    track(input = {}) {
        const company = input.company ?? {};
        const currentDepartment = company.devopsDepartment ? "DevOps" : company.securityDepartment ? "Security" : company.qaDepartment ? "QA" : "Delivery";

        return {
            projectOverview: {
                status: company.validation?.frontend?.build && company.validation?.backend?.compileall ? "In Progress" : "Planned",
                progress: company.success ? 100 : 75,
                estimatedCompletion: company.success ? "Completed" : "Pending",
                currentDepartment
            },
            companyActivity: [
                "CEO analysis",
                "Product planning",
                "Architecture",
                "Engineering",
                "QA",
                "Security",
                "DevOps"
            ]
        };
    }
}
