// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 13.2
// Engineering Prompt Builder Test
// ───────────────────────────────────────────────────────────────

import EngineeringContextBuilder
    from "./api/context/project-context-builder.js";

import PromptBuilder
    from "./api/ai/prompt-builder.js";

console.log("\n═══════════════════════════════════════════════");
console.log(" ANNEXE AI — Prompt Builder Test");
console.log("═══════════════════════════════════════════════\n");

try {

    // ----------------------------------------------------------
    // Engineering Context
    // ----------------------------------------------------------

    const contextBuilder =
        new EngineeringContextBuilder();

    const context =
        contextBuilder.build({

            engineeringPlan: {

                projectId: "PROJECT-001",

                frontend: "React 19",

                backend: "FastAPI",

                database: "PostgreSQL",

                deployment: "Docker"

            },

            executionState: {

                executionId: "EXEC-001",

                workflowId: "WF-001"

            },

            task: {

                taskId: "TASK-001",

                title: "Create Login Page",

                description:
                    "Create a responsive authentication page.",

                requirements: [

                    "Responsive",

                    "JWT Ready",

                    "Accessible"

                ]

            },

            project: {

                name:
                    "ANNEXE CRM",

                description:
                    "Enterprise CRM"

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

                testing: "Vitest",

                formatting: "Prettier",

                linting: "ESLint"

            }

        });

    console.log("✅ Engineering Context");

    // ----------------------------------------------------------
    // Prompt Builder
    // ----------------------------------------------------------

    const builder =
        new PromptBuilder();

    const prompt =
        builder.build(context);

    // ----------------------------------------------------------
    // Validation
    // ----------------------------------------------------------

    if (!prompt)
        throw new Error("Prompt not created.");

    if (!prompt.promptId)
        throw new Error("Prompt ID missing.");

    if (!prompt.prompt)
        throw new Error("Prompt text missing.");

    if (!prompt.systemInstructions)
        throw new Error("System instructions missing.");

    if (
        prompt.prompt.length < 200
    )
        throw new Error("Prompt unexpectedly short.");

    console.log("✅ Engineering Prompt");

    // ----------------------------------------------------------
    // Summary
    // ----------------------------------------------------------

    console.log("\n══════════════════════════════════════");
    console.log(" PROMPT SUMMARY");
    console.log("══════════════════════════════════════");

    console.log("Prompt ID:",
        prompt.promptId);

    console.log("Version:",
        prompt.version);

    console.log("Characters:",
        prompt.prompt.length);

    console.log("Project:",
        context.project.name);

    console.log("Task:",
        context.task.title);

    console.log("Framework:",
        context.standards.framework);

    console.log("Language:",
        context.standards.language);

    console.log("\nPrompt Preview:\n");

    console.log(
        prompt.prompt.substring(0, 400)
    );

    console.log("\n...");

    console.log("\n🎉 PROMPT BUILDER PASSED\n");

}
catch (error) {

    console.error("\n❌ PROMPT BUILDER FAILED\n");

    console.error(error);

    process.exit(1);

}