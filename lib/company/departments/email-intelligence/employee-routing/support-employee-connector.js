export default class SupportEmployeeConnector {
    connect(input = {}) {
        return {
            employee: "AI Support Employee",
            issue: input.issue ?? input.emailContext?.subject ?? "",
            severity: input.severity ?? input.emailContext?.priority ?? "medium",
            recommendedAction: input.recommendedAction ?? "investigate and draft response",
            customer: input.customer ?? null
        };
    }
}
