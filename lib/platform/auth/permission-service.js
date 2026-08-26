const ROLE_PERMISSIONS = {
  admin: [
    "*"
  ],
  owner: [
    "auth:read",
    "users:read",
    "users:write",
    "organizations:read",
    "organizations:write",
    "projects:read",
    "projects:write",
    "payments:read",
    "payments:write",
    "upgrades:read",
    "upgrades:write",
    "reports:read"
  ],
  member: [
    "auth:read",
    "projects:read",
    "projects:write",
    "payments:read",
    "upgrades:read",
    "reports:read"
  ],
  customer: [
    "auth:read",
    "projects:read",
    "payments:read",
    "upgrades:read",
    "reports:read"
  ],
  viewer: [
    "auth:read",
    "projects:read",
    "reports:read"
  ]
};

export default class PermissionService {
  permissionsFor(role) {
    return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer;
  }

  can(role, permission) {
    const permissions = this.permissionsFor(role);
    return permissions.includes("*") || permissions.includes(permission);
  }

  assert(role, permission) {
    if (!this.can(role, permission)) {
      const error = new Error(`Forbidden: ${permission}`);
      error.statusCode = 403;
      throw error;
    }
  }
}
