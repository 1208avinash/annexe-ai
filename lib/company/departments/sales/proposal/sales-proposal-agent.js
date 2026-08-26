function formatCurrency(value) {
    return `$${Math.round(Number(value ?? 0)).toLocaleString("en-US")}`;
}

export default class SalesProposalAgent {
    generate(input = {}) {
        const solutionSummary = [
            "Deliver an AI-powered CRM platform tailored to the target customer segment.",
            "Combine lead management, customer workflows, reporting, and AI-assisted prioritization."
        ];

        const businessValue = [
            "Reduce manual sales effort",
            "Improve lead-to-customer conversion",
            "Increase customer response speed",
            "Provide executive visibility into revenue flow"
        ];

        const implementationPlan = [
            "Discovery and scope confirmation",
            "Core platform implementation",
            "Testing and validation",
            "Deployment and handover"
        ];

        const timeline = input.timeline ?? "6-10 weeks";
        const pricingRecommendation = formatCurrency(input.pricingRecommendation ?? input.estimatedCost ?? 250000);
        const paymentMilestones = [
            { stage: "Advance", percentage: 50, condition: "Start after advance payment is received" },
            { stage: "Completion", percentage: 50, condition: "Release on delivery and acceptance" }
        ];

        return {
            solutionSummary,
            businessValue,
            implementationPlan,
            timeline,
            pricingRecommendation,
            paymentMilestones,
            paymentRule: "All repairs, upgrades, custom development, and software projects require 50% advance payment and 50% completion payment."
        };
    }
}
