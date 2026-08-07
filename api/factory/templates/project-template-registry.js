export default class ProjectTemplateRegistry {

    constructor(templates = []) {

        this.templates = new Map();

        for (const template of templates) {
            this.register(template);
        }

    }

    register(template) {

        if (!template) {
            throw new Error("Template is required.");
        }

        if (!template.templateId) {
            throw new Error("Template ID is required.");
        }

        this.templates.set(template.templateId, template);

        return template;

    }

    get(templateId) {

        return this.templates.get(templateId) ?? null;

    }

    list() {

        return Array.from(this.templates.values());

    }

    has(templateId) {

        return this.templates.has(templateId);

    }

    count() {

        return this.templates.size;

    }

}
