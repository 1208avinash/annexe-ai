export default class AdminCommandCenter {
  build(input = {}) {
    const company = input.company ?? {};
    const proposalValue = company.estimation?.estimation?.estimatedCost ?? 0;

    return {
      ceoDashboard: {
        revenue: `$${Math.round(proposalValue).toLocaleString("en-US")}`,
        customers: 1,
        projects: 1
      },
      salesDashboard: {
        leads: 1,
        proposals: company.proposal ? 1 : 0,
        conversions: company.success ? 1 : 0
      },
      productDashboard: {
        roadmapItems: company.productDepartment?.roadmap?.length ?? 3
      },
      engineeringDashboard: {
        activeProjects: 1,
        workload: "Balanced"
      },
      qaDashboard: {
        certifications: company.qaDepartment?.report?.status ? 1 : 0
      },
      securityDashboard: {
        vulnerabilities: 0
      },
      devopsDashboard: {
        deployments: 1
      },
      revenueDashboard: {
        recurringRevenue: "Maintenance and upgrade subscriptions"
      }
    };
  }
}
