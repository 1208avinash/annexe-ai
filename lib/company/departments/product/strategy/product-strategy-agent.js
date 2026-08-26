function normalizeText(value) {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

export default class ProductStrategyAgent {
    generate(input = {}) {
        const text = normalizeText(input.requestText ?? input.analysis?.requestText ?? "");
        const industry = input.industry ?? input.analysis?.industry ?? "Business Software";
        const customerGoals = input.customerGoals ?? [];

        const vision = text.includes("crm")
            ? "AI powered CRM platform"
            : `AI powered ${industry} platform`;

        const targetUsers = /real estate|agency|broker|sales/.test(text)
            ? "Real estate sales teams"
            : input.targetUsers ?? "Business users and administrators";

        const businessGoals = Array.from(new Set([
            ...(Array.isArray(customerGoals) ? customerGoals : []),
            "increase sales efficiency",
            "automate follow-up",
            "improve customer visibility"
        ]));

        const productVision = {
            vision,
            targetUsers,
            businessGoals
        };

        return productVision;
    }
}
