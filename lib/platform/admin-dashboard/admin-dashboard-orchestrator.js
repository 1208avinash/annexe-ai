export default class AdminDashboardOrchestrator {
    processRequest(input = {}) {
        const company = input.company ?? {};
        const proposalValue = company.estimation?.estimation?.estimatedCost ?? 0;

        return {
            views: {
                ceo: {
                    revenue: `$${Math.round(proposalValue).toLocaleString("en-US")}`,
                    projects: 1,
                    customers: 1
                },
                sales: {
                    leads: 1,
                    proposals: company.proposal ? 1 : 0,
                    conversions: company.success ? 1 : 0
                },
                engineering: {
                    activeProjects: 1,
                    workload: "Balanced"
                },
                qa: {
                    certifications: company.qaDepartment?.report?.status ? 1 : 0
                },
                security: {
                    vulnerabilities: 0
                },
                devops: {
                    deployments: 1
                },
                upgrade: {
                    recurringRevenue: "Maintenance and upgrade subscriptions"
                }
            }
        };
    }
}
