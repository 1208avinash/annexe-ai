export default class PolicyEvaluator {
    evaluate(input = {}) {
        const permission = String(input.permission ?? "");
        const role = String(input.role ?? "");
        const resource = String(input.resource ?? "");

        const allowed = Boolean(input.allowed) || (
            input.organization &&
            role &&
            permission &&
            resource &&
            input.permissionResult?.allowed !== false
        );

        return {
            allowed,
            reason: allowed ? "Policy matched governance rules." : "Policy denied by governance rules.",
            policy: input.policy ?? "default-access-policy",
            resource
        };
    }
}
