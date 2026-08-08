export default class ProjectTemplate {

    constructor(data = {}) {

        this.templateId = data.templateId ?? "";
        this.name = data.name ?? "";
        this.category = data.category ?? "";
        this.industry = data.industry ?? "";
        this.frontend = data.frontend ?? "";
        this.backend = data.backend ?? "";
        this.database = data.database ?? "";
        this.deployment = data.deployment ?? "";
        this.authentication = data.authentication ?? "JWT";
        this.authorization = data.authorization ?? "RBAC";
        this.modules = data.modules ?? [];
        this.entities = data.entities ?? [];
        this.services = data.services ?? [];
        this.apis = data.apis ?? [];
        this.roles = data.roles ?? [];
        this.workflows = data.workflows ?? [];
        this.testing = data.testing ?? [];
        this.documentation = data.documentation ?? [];

    }

    toJSON() {

        return { ...this };

    }

}
