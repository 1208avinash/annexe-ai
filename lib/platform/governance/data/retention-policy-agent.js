export default class RetentionPolicyAgent {
    createPolicies(input = {}) {
        return {
            temporary: "30 days",
            standard: "1 year",
            regulated: "7 years",
            rules: {
                customerData: "standard",
                projectCode: "regulated",
                publicReports: "temporary"
            },
            ready: true
        };
    }
}
