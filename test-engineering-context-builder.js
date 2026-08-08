// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 13.1
// Engineering Context Builder Test
// ───────────────────────────────────────────────────────────────

import EngineeringContextBuilder
    from "./lib/context/project-context-builder.js";

console.log("\n═══════════════════════════════════════════════");
console.log(" ANNEXE AI — Engineering Context Builder Test");
console.log("═══════════════════════════════════════════════\n");

try {

    const builder =
        new EngineeringContextBuilder();

    const engineeringPlan = {

        projectId: "PROJECT-001",

        frontend: "React 19",

        backend: "FastAPI",

        database: "PostgreSQL",

        deployment: "Docker"

    };

    const executionState = {

        executionId: "EXEC-001",

        workflowId: "WF-001"

    };

    const task = {

        taskId: "TASK-001",

        title: "Create Login Page",

        description:
            "Implement the application login page.",

        requirements: [

            "Responsive",

            "Accessible",

            "JWT Ready"

        ]

    };

    const context = builder.build({

        engineeringPlan,

        executionState,

        task,

        project: {

            name: "ANNEXE CRM",

            description:
                "AI Powered CRM Platform"

        },

        repository: {

            branch: "main",

            files: [

                "frontend/src/App.jsx",

                "frontend/src/routes.jsx"

            ]

        },

        standards: {

            language: "TypeScript",

            framework: "React",

            linting: "ESLint",

            formatting: "Prettier",

            testing: "Vitest"

        }

    });

    // ----------------------------------------------------------
    // Validation
    // ----------------------------------------------------------

    if (!context)
        throw new Error("Context not generated.");

    if (!context.contextId)
        throw new Error("contextId missing");

    if (context.project.id !== "PROJECT-001")
        throw new Error("Project ID mismatch");

    if (context.architecture.frontend !== "React 19")
        throw new Error("Frontend missing");

    if (context.architecture.backend !== "FastAPI")
        throw new Error("Backend missing");

    if (context.task.id !== "TASK-001")
        throw new Error("Task missing");

    console.log("✅ Engineering Context");

    // ----------------------------------------------------------
    // Summary
    // ----------------------------------------------------------

    console.log("\n══════════════════════════════════════");
    console.log(" ENGINEERING CONTEXT SUMMARY");
    console.log("══════════════════════════════════════");

    console.log("Context:",
        context.contextId);

    console.log("Project:",
        context.project.name);

    console.log("Frontend:",
        context.architecture.frontend);

    console.log("Backend:",
        context.architecture.backend);

    console.log("Database:",
        context.architecture.database);

    console.log("Deployment:",
        context.architecture.deployment);

    console.log("Task:",
        context.task.title);

    console.log("Repository Branch:",
        context.repository.branch);

    console.log("Known Files:",
        context.repository.existingFiles.length);

    console.log("Language:",
        context.standards.language);

    console.log("Framework:",
        context.standards.framework);

    console.log("\n🎉 ENGINEERING CONTEXT BUILDER PASSED\n");

}
catch (error) {

    console.error("\n❌ ENGINEERING CONTEXT BUILDER FAILED\n");

    console.error(error);

    process.exit(1);

}