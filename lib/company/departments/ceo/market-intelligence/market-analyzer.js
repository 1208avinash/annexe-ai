function normalizeText(value) {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

export default class MarketAnalyzer {
    analyze(input = {}) {
        const text = normalizeText(
            input.requestText ??
            input.industry ??
            input.analysis?.industry ??
            ""
        );
        const industry = input.industry ?? input.analysis?.industry ?? "Business Software";

        const competition = [];
        if (text.includes("real estate") || text.includes("crm")) {
            competition.push("Generic CRMs", "Real estate sales tools", "Manual spreadsheet-based workflows");
        }
        else {
            competition.push("Established SaaS platforms", "Internal legacy systems");
        }

        const marketOpportunity = text.includes("real estate")
            ? "High opportunity in brokerage workflow automation and lead conversion."
            : "Moderate opportunity for workflow digitization and growth-oriented automation.";

        const growthPotential = text.includes("ai")
            ? "Strong due to AI-assisted qualification, forecasting, and customer engagement."
            : "Strong if the business prioritizes automation and customer visibility.";

        return {
            industry,
            marketOpportunity,
            competition,
            growthPotential,
            confidence: 0.9
        };
    }
}
