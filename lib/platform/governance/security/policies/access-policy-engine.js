import PolicyEvaluator from "./policy-evaluator.js";

export default class AccessPolicyEngine {
    constructor({ policyEvaluator = new PolicyEvaluator() } = {}) {
        this.policyEvaluator = policyEvaluator;
    }

    evaluate(input = {}) {
        return this.policyEvaluator.evaluate(input);
    }
}
