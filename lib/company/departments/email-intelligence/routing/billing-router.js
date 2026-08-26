export default class BillingRouter {
    route(input = {}) {
        return {
            department: "billing",
            priority: "high",
            action: "human_review",
            category: input.category ?? "BILLING"
        };
    }
}
