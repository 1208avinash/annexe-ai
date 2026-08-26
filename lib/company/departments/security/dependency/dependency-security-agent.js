export default class DependencySecurityAgent {
    review(input = {}) {
        const dependencies = Array.isArray(input.composition?.dependencies)
            ? input.composition.dependencies
            : [];

        const vulnerablePackages = dependencies.filter(item => String(item?.risk ?? "").toLowerCase() === "high");
        const outdatedLibraries = dependencies.filter(item => String(item?.status ?? "").toLowerCase() === "outdated");

        return {
            vulnerablePackages,
            outdatedLibraries,
            supplyChainRisks: vulnerablePackages.length || outdatedLibraries.length ? "Review required" : "Low",
            dependencyHealth: "Healthy",
            score: vulnerablePackages.length || outdatedLibraries.length ? 90 : 98,
            status: vulnerablePackages.length || outdatedLibraries.length ? "WARN" : "PASS"
        };
    }
}
