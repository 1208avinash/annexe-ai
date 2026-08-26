import AccessPolicyEngine from "../policies/access-policy-engine.js";
import PermissionManager from "../permissions/permission-manager.js";

export default class ResourceAccessController {
    constructor({
        accessPolicyEngine = new AccessPolicyEngine(),
        permissionManager = new PermissionManager()
    } = {}) {
        this.accessPolicyEngine = accessPolicyEngine;
        this.permissionManager = permissionManager;
    }

    authorize(input = {}) {
        const permissionResult = this.permissionManager.evaluate({
            role: input.role,
            permission: input.permission
        });
        const policyResult = this.accessPolicyEngine.evaluate({
            ...input,
            permissionResult,
            allowed: permissionResult.allowed
        });

        return {
            allowed: Boolean(policyResult.allowed && permissionResult.allowed),
            reason: policyResult.reason,
            policy: policyResult.policy,
            permissionResult,
            policyResult
        };
    }
}
