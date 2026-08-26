import PermissionService from "../../../auth/permission-service.js";

export default class PermissionManager {
    constructor({ permissionService = new PermissionService() } = {}) {
        this.permissionService = permissionService;
    }

    evaluate({ role, permission } = {}) {
        const allowed = this.permissionService.can(role, permission);
        return {
            allowed,
            denied: !allowed,
            reason: allowed ? "Permission granted by role policy." : "Permission denied by role policy.",
            permission: permission ?? null,
            role: role ?? null
        };
    }
}
