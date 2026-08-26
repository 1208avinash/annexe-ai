export default class SalesEmployeeConnector {
    connect(input = {}) {
        const customer = input.customer ?? {};
        const history = input.history ?? {};
        return {
            employee: "AI Sales Employee",
            action: "prepare_sales_response",
            recommendedNextStep: input.intent === "DEMO_REQUEST"
                ? "schedule a demo"
                : history.conversationCount >= 2
                    ? "prepare proposal"
                    : "follow up with pricing and discovery",
            customer,
            history,
            intent: input.intent ?? null,
            emailContext: input.emailContext ?? null
        };
    }
}
