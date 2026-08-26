function normalizeText(value) {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

export default class RiskAnalysisAgent {
    analyze(input = {}) {
        const text = normalizeText(input.requestText ?? input.industry ?? "");

        const businessRisk = text.includes("real estate")
            ? "Medium: adoption and sales process change management."
            : "Medium: market fit and adoption uncertainty.";

        const technicalRisk = "Medium: integrations, auth, and data migration complexity.";
        const securityRisk = "Medium: access control, secrets handling, and auditability.";
        const adoptionRisk = text.includes("ai")
            ? "Low to medium: user trust in AI-assisted recommendations."
            : "Medium: training and workflow change resistance.";

        return {
            businessRisk,
            technicalRisk,
            securityRisk,
            adoptionRisk
        };
    }
}
