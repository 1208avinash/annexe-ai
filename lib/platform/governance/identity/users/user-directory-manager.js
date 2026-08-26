export default class UserDirectoryManager {
    constructor({ organizationName = "Enterprise Customer" } = {}) {
        this.organizationName = organizationName;
    }

    build(input = {}) {
        const organization = input.organization ?? {
            id: "org-enterprise-customer",
            name: this.organizationName,
            type: "enterprise"
        };

        const users = (input.users ?? [
            { id: "user-admin", name: "Administrator", email: "admin@annexe.ai", role: "Administrator" },
            { id: "user-manager", name: "Manager", email: "manager@annexe.ai", role: "Manager" },
            { id: "user-developer", name: "Developer", email: "developer@annexe.ai", role: "Developer" },
            { id: "user-auditor", name: "Auditor", email: "auditor@annexe.ai", role: "Auditor" },
            { id: "user-customer", name: "Customer", email: "customer@annexe.ai", role: "Customer" }
        ]).map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department ?? "General",
            status: user.status ?? "active"
        }));

        return {
            organization,
            users,
            userCount: users.length,
            ready: true
        };
    }
}
