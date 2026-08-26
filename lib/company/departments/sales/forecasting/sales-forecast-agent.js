export default class SalesForecastAgent {
    forecast(input = {}) {
        const leadScore = Number(input.leadScore ?? 0);
        const closingProbability = Math.max(35, Math.min(95, leadScore));
        const expectedRevenue = Number(input.pricingRecommendation ?? 250000);
        const expectedTimeline = input.timeline ?? "6-10 weeks";
        const dealConfidence = closingProbability >= 80 ? "High" : "Medium";

        return {
            closingProbability,
            expectedRevenue,
            expectedTimeline,
            dealConfidence
        };
    }
}
