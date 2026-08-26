export default class OrganizationRoleManager {
    build(input = {}) {
        const organization = input.organization ?? { id: null, name: "Enterprise Customer" };

        return {
            organizationId: organization.id ?? null,
            organizationName: organization.name ?? null,
            departmentAccess: input.departmentAccess ?? [
                "projects",
                "deployment",
                "security",
                "billing",
                "audit"
            ],
            ready: true
        };
    }
}
