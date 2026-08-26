const SALES_INTENTS = new Set(["SALES_INQUIRY", "DEMO_REQUEST", "PARTNERSHIP_REQUEST"]);

export default class AiEmployeeRouter {
    route(input = {}) {
        const intent = String(input.intent ?? "").toUpperCase();
        const category = String(input.category ?? "GENERAL").toUpperCase();
        const priority = String(input.priority ?? "medium").toLowerCase();
        const securityRisk = String(input.customerContext?.securityRisk ?? input.securityRisk ?? "").toLowerCase();

        if (securityRisk === "high" || securityRisk === "critical" || category === "SECURITY" || intent === "SECURITY_REPORT") {
            return {
                employee: "AI Security Employee",
                department: "security",
                action: "security_review",
                confidence: 0.99
            };
        }

        if (category === "BILLING" || intent === "BILLING_REQUEST") {
            return {
                employee: "AI Billing Employee",
                department: "billing",
                action: "billing_review",
                confidence: 0.96
            };
        }

        if (category === "SUPPORT" || intent === "SUPPORT_REQUEST") {
            return {
                employee: "AI Support Employee",
                department: "support",
                action: "draft_reply",
                confidence: 0.94
            };
        }

        if (SALES_INTENTS.has(intent) || category === "SALES") {
            return {
                employee: "AI Sales Employee",
                department: "sales",
                action: "prepare_sales_response",
                confidence: priority === "high" ? 0.98 : 0.95
            };
        }

        return {
            employee: "AI CEO",
            department: "ceo",
            action: "executive_insight",
            confidence: 0.9
        };
    }
}
