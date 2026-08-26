export default class SalesRouter {
    route(input = {}) {
        return {
            department: "sales",
            priority: "high",
            action: "draft_reply",
            category: input.category ?? "SALES"
        };
    }
}
