function normalizeText(value) {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

export default class NegotiationAgent {
    analyze(input = {}) {
        const text = normalizeText(input.requestText ?? input.analysis?.requestText ?? "");
        const pricingObjections = [];
        const timelineObjections = [];
        const featureDiscussions = [];
        const packageRecommendations = [];

        if (text.includes("real estate")) {
            pricingObjections.push("Offer phased rollout pricing.");
            timelineObjections.push("Clarify that launch can start with an MVP.");
            featureDiscussions.push("Lead tracking, dashboards, and customer workflows.");
            packageRecommendations.push("Enterprise CRM starter package");
        }
        else {
            pricingObjections.push("Use value-based pricing language.");
            timelineObjections.push("Offer milestone-based delivery.");
            featureDiscussions.push("Core workflow and reporting package.");
            packageRecommendations.push("Standard business platform package");
        }

        return {
            pricingObjections,
            timelineObjections,
            featureDiscussions,
            packageRecommendations
        };
    }
}
