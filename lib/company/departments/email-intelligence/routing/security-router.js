export default class SecurityRouter {
    route(input = {}) {
        return {
            department: "security",
            priority: "critical",
            action: "block_review",
            category: input.category ?? "SECURITY"
        };
    }
}
