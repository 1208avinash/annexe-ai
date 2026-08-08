import BuildBlueprint from "./blueprints/build-blueprint.js";
import ProjectTemplateRegistry from "./templates/project-template-registry.js";
import crmTemplate from "./templates/library/crm-template.js";
import {
    ApplicationAssembler,
    CapabilityRegistry,
    coreCapabilities
} from "../capability-engine/index.js";

function compactText(value) {

    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim();

}

function slugify(value) {

    return String(value ?? "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

}

function buildCapabilityPaths(capabilities = []) {

    return capabilities.map(capability => {
        const capabilitySlug = slugify(capability.name);
        return {
            name: capability.name,
            slug: capabilitySlug,
            root: `capabilities/${capabilitySlug}`,
            directories: [
                `capabilities/${capabilitySlug}`,
                `capabilities/${capabilitySlug}/backend`,
                `capabilities/${capabilitySlug}/frontend`,
                `capabilities/${capabilitySlug}/tests`,
                `capabilities/${capabilitySlug}/docs`
            ],
            requiredFiles: [
                `capabilities/${capabilitySlug}/capability.json`,
                `capabilities/${capabilitySlug}/backend/README.md`,
                `capabilities/${capabilitySlug}/frontend/README.md`,
                `capabilities/${capabilitySlug}/tests/README.md`,
                `capabilities/${capabilitySlug}/docs/README.md`,
                `capabilities/${capabilitySlug}/dependencies.json`
            ]
        };
    });

}

function buildEngineeringPlan(template, analysis, request, assembly) {

    const selectedCapabilities = assembly?.selectedCapabilities ?? analysis.recommendedCapabilities ?? [];

    return {
        projectType: analysis.projectType,
        frontend: template.frontend,
        backend: template.backend,
        database: template.database,
        deployment: template.deployment,
        functionalRequirements: [
            "Authentication",
            "JWT Session Management",
            "Dashboard",
            "Customer Management",
            "Lead Management",
            "Reporting",
            "Notifications",
            "Automation"
        ],
        nonFunctionalRequirements: [
            "Secure by default",
            "Responsive UI",
            "Production ready"
        ],
        frontendModules: template.modules,
        backendServices: template.services,
        entities: template.entities,
        endpoints: template.apis,
        capabilities: selectedCapabilities,
        authentication: template.authentication,
        authorization: template.authorization,
        securityRequirements: [
            "Password hashing",
            "Role based access control",
            "Audit logging",
            "Rate limiting"
        ],
        acceptanceCriteria: [
            "Users can authenticate",
            "Users can navigate the app through protected routes",
            "Leads can be tracked",
            "Customers can be managed",
            "Reports can be viewed"
        ],
        successMetrics: [
            "Core CRM pages render and route correctly",
            "Backend health endpoint responds",
            "Scaffold is written to workspace",
            "Capabilities are resolved and assembled"
        ],
        risks: analysis.risks,
        assumptions: [
            "CRM is the first enterprise target",
            "The template should be used as the baseline scaffold",
            "Capabilities should be composed rather than duplicated"
        ],
        projectId: request.project?.projectId ?? request.project?.id ?? null
    };

}

function buildStructure(template, analysis, assembly) {

    const capabilityPaths = buildCapabilityPaths(assembly?.capabilities ?? []);

    return {
        backend: {
            stack: "FastAPI",
            root: "backend",
            directories: [
                "backend",
                "backend/app",
                "backend/app/routers",
                "backend/app/models",
                "backend/app/schemas",
                "backend/app/services",
                "backend/app/repositories",
                "backend/alembic",
                "backend/alembic/versions",
                "backend/scripts",
                "backend/tests",
                "capabilities"
            ],
            requiredFiles: [
                "backend/requirements.txt",
                "backend/Dockerfile",
                "backend/.env.example",
                "backend/README.md",
                "backend/alembic.ini",
                "backend/app/__init__.py",
                "backend/app/main.py",
                "backend/app/config.py",
                "backend/app/database.py",
                "backend/app/dependencies.py",
                "backend/app/logging_config.py",
                "backend/app/security.py",
                "backend/app/version.py",
                "backend/app/routers/__init__.py",
                "backend/app/routers/health.py",
                "backend/app/routers/auth.py",
                "backend/app/routers/customers.py",
                "backend/app/routers/crm.py",
                "backend/app/models/__init__.py",
                "backend/app/models/crm.py",
                "backend/app/schemas/__init__.py",
                "backend/app/schemas/crm.py",
                "backend/app/services/__init__.py",
                "backend/app/services/crm_service.py",
                "backend/app/repositories/__init__.py",
                "backend/app/repositories/crm_repository.py",
                "backend/alembic/env.py",
                "backend/alembic/versions/0001_initial.py",
                "backend/scripts/migrate.py",
                "backend/tests/test_health.py",
                "backend/tests/test_auth.py",
                "backend/tests/test_customers.py",
                "backend/pytest.py",
                "capabilities/index.json",
                "capabilities/README.md"
            ]
        },
        frontend: {
            stack: "React + Vite",
            root: "frontend",
            directories: [
                "frontend",
                "frontend/public",
                "frontend/src",
                "frontend/src/pages",
                "frontend/src/components",
                "frontend/src/layouts",
                "frontend/src/hooks",
                "frontend/src/services",
                "frontend/src/contexts",
                "frontend/src/assets",
                "frontend/tests"
            ],
            requiredFiles: [
                "frontend/package.json",
                "frontend/vite.config.js",
                "frontend/index.html",
                "frontend/README.md",
                "frontend/.env.example",
                "frontend/Dockerfile",
                "frontend/src/main.jsx",
                "frontend/src/App.jsx",
                "frontend/src/pages/Login.jsx",
                "frontend/src/pages/Dashboard.jsx",
                "frontend/src/pages/Customers.jsx",
                "frontend/src/pages/CustomerDetails.jsx",
                "frontend/src/layouts/MainLayout.jsx",
                "frontend/src/services/api.js",
                "frontend/src/contexts/AuthContext.jsx",
                "frontend/tests/smoke.mjs"
            ]
        },
        capabilities: {
            root: "capabilities",
            selected: capabilityPaths.map(entry => entry.name),
            directories: capabilityPaths.flatMap(entry => entry.directories),
            requiredFiles: capabilityPaths.flatMap(entry => entry.requiredFiles)
        },
        domain: {
            projectType: analysis.projectType,
            modules: template.modules,
            entities: template.entities,
            services: template.services,
            apis: template.apis,
            workflows: template.workflows,
            capabilities: assembly?.selectedCapabilities ?? analysis.recommendedCapabilities ?? []
        }
    };

}

export default class TemplateCompiler {

    constructor({ registry = null } = {}) {

        this.registry = registry ?? new ProjectTemplateRegistry([crmTemplate]);
        this.capabilityRegistry = new CapabilityRegistry(coreCapabilities);
        this.applicationAssembler = new ApplicationAssembler({
            registry: this.capabilityRegistry
        });

        if (!this.registry.has("crm-enterprise")) {
            this.registry.register(crmTemplate);
        }

    }

    compile({
        request = {},
        businessAnalysis = {},
        templateId = null
    } = {}) {

        const chosenTemplate =
            this.registry.get(
                templateId ??
                businessAnalysis.templateId ??
                "crm-enterprise"
            ) ?? this.registry.get("crm-enterprise");

        if (!chosenTemplate) {
            throw new Error("No project template available.");
        }

        const assembly =
            this.applicationAssembler.assemble({
                request,
                businessAnalysis,
                template: chosenTemplate,
                requestedCapabilities:
                    request.capabilityComposition ??
                    request.requestedCapabilities ??
                    businessAnalysis.recommendedCapabilities
            });

        const engineeringPlan =
            buildEngineeringPlan(chosenTemplate, businessAnalysis, request, assembly);

        const structure =
            buildStructure(chosenTemplate, businessAnalysis, assembly);

        return new BuildBlueprint({
            blueprintId: `BLUEPRINT-${Date.now()}`,
            templateId: chosenTemplate.templateId,
            projectId: request.project?.projectId ?? request.project?.id ?? "",
            architecture: {
                frontend: chosenTemplate.frontend,
                backend: chosenTemplate.backend,
                database: chosenTemplate.database,
                deployment: chosenTemplate.deployment
            },
            modules: chosenTemplate.modules,
            entities: chosenTemplate.entities,
            services: chosenTemplate.services,
            apis: chosenTemplate.apis,
            roles: chosenTemplate.roles,
            workflows: chosenTemplate.workflows,
            engineeringTasks: [],
            dependencies: assembly.dependencies,
            deployment: {
                platform: chosenTemplate.deployment,
                strategy: "Docker"
            },
            testing: chosenTemplate.testing,
            documentation: chosenTemplate.documentation,
            metadata: {
                industry: businessAnalysis.industry ?? chosenTemplate.industry,
                projectName: request.project?.name ?? chosenTemplate.name,
                stack: {
                    backend: chosenTemplate.backend,
                    frontend: chosenTemplate.frontend,
                    database: chosenTemplate.database,
                    deployment: chosenTemplate.deployment
                }
            },
            structure,
            capabilities: assembly.capabilities,
            capabilityRegistry: {
                totalCapabilities: this.capabilityRegistry.count(),
                selectedCapabilities: assembly.selectedCapabilities
            },
            applicationAssembly: assembly,
            stackMetadata: {
                backend: {
                    framework: chosenTemplate.backend,
                    runtime: "Python",
                    packageManager: "pip",
                    buildCommand: "python -m compileall backend"
                },
                frontend: {
                    framework: chosenTemplate.frontend,
                    runtime: "Node.js",
                    packageManager: "npm",
                    buildCommand: "npm run build"
                }
            },
            requiredFiles: [
                ...structure.backend.requiredFiles,
                ...structure.frontend.requiredFiles,
                ...structure.capabilities.requiredFiles
            ],
            directories: [
                ...structure.backend.directories,
                ...structure.frontend.directories,
                ...structure.capabilities.directories
            ],
            businessModules: structure.domain,
            engineeringPlan,
            files: [
                {
                    path: "reports/project-structure.json",
                    type: "artifact",
                    language: "json",
                    content: JSON.stringify({
                        structure,
                        stackMetadata: {
                            backend: {
                                framework: chosenTemplate.backend,
                                runtime: "Python",
                                packageManager: "pip",
                                buildCommand: "python -m compileall backend"
                            },
                            frontend: {
                                framework: chosenTemplate.frontend,
                                runtime: "Node.js",
                                packageManager: "npm",
                                buildCommand: "npm run build"
                            }
                        },
                        requiredFiles: [
                            ...structure.backend.requiredFiles,
                            ...structure.frontend.requiredFiles
                        ],
                        directories: [
                            ...structure.backend.directories,
                            ...structure.frontend.directories
                        ],
                        businessModules: structure.domain
                    }, null, 2)
                },
                {
                    path: "reports/engineering-plan.json",
                    type: "artifact",
                    language: "json",
                    content: JSON.stringify(engineeringPlan, null, 2)
                }
            ]
        });

    }

}
