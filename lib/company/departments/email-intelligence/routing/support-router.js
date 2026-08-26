export default class SupportRouter {
    route(input = {}) {
        return {
            department: "support",
            priority: "medium",
            action: "draft_reply",
            category: input.category ?? "SUPPORT"
        };
    }
}
