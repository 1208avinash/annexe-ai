function normalizeFeature(feature) {
    return String(feature ?? "").trim();
}

function inferPriority(feature, index) {
    const lower = feature.toLowerCase();
    if (lower.includes("authentication") || lower.includes("customer") || lower.includes("dashboard")) {
        return "P1";
    }
    if (lower.includes("automation") || lower.includes("analytics") || lower.includes("notification")) {
        return "P2";
    }
    if (lower.includes("ai") || lower.includes("predict")) {
        return "P3";
    }
    return index === 0 ? "P1" : "P2";
}

export default class FeaturePrioritizer {
    prioritize(input = {}) {
        const features = (input.features ?? []).map(normalizeFeature).filter(Boolean);
        return features.map((feature, index) => ({
            feature,
            impact: feature.toLowerCase().includes("ai") ? "High" : "Medium",
            customerValue: feature.toLowerCase().includes("customer") ? "High" : "Medium",
            developmentEffort: feature.toLowerCase().includes("ai") ? "High" : "Medium",
            urgency: index < 3 ? "High" : "Medium",
            dependency: index === 0 ? "None" : "Core platform",
            priority: inferPriority(feature, index)
        }));
    }
}
