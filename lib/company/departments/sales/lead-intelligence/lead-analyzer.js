function normalizeText(value) {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

export default class LeadAnalyzer {
    analyze(input = {}) {
        const text = normalizeText(input.requestText ?? input.analysis?.requestText ?? "");
        const industry = input.industry ?? input.analysis?.industry ?? "Business Software";
        const companySize = input.companySize ?? input.analysis?.companySize ?? "Mid-Market";
        const buyingIntent = text.includes("build") || text.includes("create") || text.includes("platform")
            ? "High"
            : "Medium";
        const urgency = /urgent|asap|soon|now|immediately/.test(text) ? "High" : "Medium";
        const budgetProbability = /enterprise|ai|platform|real estate/.test(text) ? "High" : "Medium";
        const enterprisePotential = /enterprise|company|companies|platform/.test(text) ? "High" : "Medium";
        const leadScore = Math.min(100, Math.round(
            (buyingIntent === "High" ? 30 : 18) +
            (urgency === "High" ? 20 : 10) +
            (budgetProbability === "High" ? 25 : 12) +
            (enterprisePotential === "High" ? 25 : 15)
        ));

        return {
            industry,
            companySize,
            businessType: input.businessType ?? input.analysis?.businessType ?? "CRM",
            buyingIntent,
            urgency,
            budgetProbability,
            enterprisePotential,
            leadScore,
            customerType: leadScore >= 80 ? "Enterprise" : "SMB",
            buyingProbability: leadScore >= 80 ? "High" : "Medium",
            recommendedAction: leadScore >= 80 ? "Create proposal" : "Run discovery"
        };
    }
}
