export default class StrategyAgent {
    generate(input = {}) {
        const market = input.market ?? {};
        const industry = input.industry ?? "Business Software";

        const businessStrategy = [
            "Lead with a vertical CRM tailored to the target industry.",
            "Automate the highest-friction workflows first.",
            "Use reporting and dashboards to demonstrate measurable outcomes."
        ];

        const productRecommendation = [
            "Customer and lead management core",
            "Workflow automation",
            "Analytics and executive dashboards",
            "AI-assisted prioritization and summaries"
        ];

        const competitiveAdvantage = [
            `Industry-specific positioning for ${industry}.`,
            "Faster time-to-value through prebuilt templates.",
            "Operational intelligence across the customer lifecycle."
        ];

        const goToMarketDirection = market.growthPotential?.includes("Strong")
            ? "Target niche operators with a fast implementation offer and a clear ROI story."
            : "Target operational teams with a standard SaaS adoption motion.";

        return {
            businessStrategy,
            productRecommendation,
            competitiveAdvantage,
            goToMarketDirection
        };
    }
}
