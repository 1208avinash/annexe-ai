export default class RoleManager {
    build(input = {}) {
        const roles = input.roles ?? [
            "Administrator",
            "Manager",
            "Developer",
            "Auditor",
            "Customer"
        ];

        return {
            roles,
            roleCount: roles.length,
            ready: true
        };
    }
}
