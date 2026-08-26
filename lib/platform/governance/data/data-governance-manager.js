import DataClassificationAgent from "./data-classification-agent.js";
import RetentionPolicyAgent from "./retention-policy-agent.js";

export default class DataGovernanceManager {
    constructor({
        dataClassificationAgent = new DataClassificationAgent(),
        retentionPolicyAgent = new RetentionPolicyAgent()
    } = {}) {
        this.dataClassificationAgent = dataClassificationAgent;
        this.retentionPolicyAgent = retentionPolicyAgent;
    }

    build(input = {}) {
        const classification = this.dataClassificationAgent.classify(input);
        const retention = this.retentionPolicyAgent.createPolicies(input);

        return {
            classification,
            retention,
            accessRules: {
                customerData: ["Administrator", "Manager"],
                projectCode: ["Administrator", "Manager", "Developer"],
                publicReports: ["Administrator", "Manager", "Developer", "Auditor", "Customer"]
            },
            score: 94,
            ready: true
        };
    }
}
