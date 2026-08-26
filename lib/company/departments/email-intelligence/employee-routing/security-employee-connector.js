export default class SecurityEmployeeConnector {
    connect(input = {}) {
        return {
            employee: "AI Security Employee",
            riskLevel: input.riskLevel ?? "medium",
            action: "security_review",
            customer: input.customer ?? null,
            indicators: input.indicators ?? []
        };
    }
}
