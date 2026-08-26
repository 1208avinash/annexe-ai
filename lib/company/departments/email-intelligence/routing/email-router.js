import SalesRouter from "./sales-router.js";
import SupportRouter from "./support-router.js";
import BillingRouter from "./billing-router.js";
import SecurityRouter from "./security-router.js";

export default class EmailRouter {
    constructor({
        salesRouter = new SalesRouter(),
        supportRouter = new SupportRouter(),
        billingRouter = new BillingRouter(),
        securityRouter = new SecurityRouter()
    } = {}) {
        this.salesRouter = salesRouter;
        this.supportRouter = supportRouter;
        this.billingRouter = billingRouter;
        this.securityRouter = securityRouter;
    }

    route(input = {}) {
        const category = String(input.category ?? "GENERAL").toUpperCase();

        switch (category) {
            case "SALES":
                return this.salesRouter.route({ ...input, category });
            case "SUPPORT":
                return this.supportRouter.route({ ...input, category });
            case "BILLING":
                return this.billingRouter.route({ ...input, category });
            case "SECURITY":
            case "SPAM":
                return this.securityRouter.route({ ...input, category });
            default:
                return {
                    department: "general",
                    priority: "low",
                    action: "draft_reply",
                    category: "GENERAL"
                };
        }
    }
}
