export default class BusinessAnalyzer {

    analyze(request = {}) {

        const project = request.project ?? {};
        const requirements = Array.isArray(request.requirements)
            ? request.requirements
            : Array.isArray(project.requirements)
                ? project.requirements
                : [];

        const text = [
            project.name,
            project.description,
            project.industry,
            request.challenge,
            request.solution,
            ...requirements
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        const isCrm =
            text.includes("crm") ||
            text.includes("lead") ||
            text.includes("customer") ||
            text.includes("sales") ||
            text.includes("contact");

        const industry =
            project.industry ??
            request.industry ??
            (isCrm ? "CRM" : "Enterprise Software");

        return {
            analysisId: `BA-${Date.now()}`,
            projectId: project.projectId ?? project.id ?? null,
            projectName: project.name ?? "Enterprise Project",
            industry,
            projectType: isCrm ? "crm" : "enterprise",
            templateId: "crm-enterprise",
            businessGoals: isCrm
                ? [
                    "Manage customer relationships",
                    "Qualify leads automatically",
                    "Track pipeline progress",
                    "Improve team productivity"
                ]
                : [
                    "Deliver the requested enterprise capability",
                    "Automate the main operational workflow",
                    "Provide a production-ready delivery path"
                ],
            features: isCrm
                ? [
                    "authentication",
                    "dashboard",
                    "crm",
                    "contacts",
                    "leads",
                    "reports",
                    "notifications",
                    "automation"
                ]
                : [
                    "authentication",
                    "dashboard"
                ],
            recommendedCapabilities: isCrm
                ? [
                    "authentication",
                    "users",
                    "roles",
                    "permissions",
                    "dashboard",
                    "notifications",
                    "audit-logs",
                    "email",
                    "file-storage",
                    "settings",
                    "search",
                    "reports",
                    "health",
                    "version",
                    "logging",
                    "crm"
                ]
                : [
                    "authentication",
                    "users",
                    "dashboard",
                    "health",
                    "version",
                    "logging"
                ],
            risks: isCrm
                ? [
                    "Data model scope can expand quickly",
                    "Role and permission design needs early confirmation",
                    "CRM workflow breadth can increase implementation time"
                ]
                : [
                    "Enterprise scope can expand during delivery"
                ]
        };

    }

}
