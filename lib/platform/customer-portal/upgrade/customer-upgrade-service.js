export default class CustomerUpgradeService {
    build(input = {}) {
        const evolution = input.company?.evolutionDepartment ?? {};
        const upgrade = input.company?.upgradeDepartment ?? {};

        return {
            improvementRecommendations: evolution.recommendation?.prioritizedImprovements ?? [],
            upgradeRequests: upgrade.plan?.implementationPhases ?? [],
            evolutionSuggestions: evolution.roadmap?.immediateImprovements ?? [],
            recurringRevenue: "Maintenance subscription and paid upgrades"
        };
    }
}
