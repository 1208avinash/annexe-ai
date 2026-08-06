// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 13.4
// Real AI Generation Integration Test
// End-to-End Software Factory
// ───────────────────────────────────────────────────────────────

import EngineeringContextBuilder
    from "./api/context/project-context-builder.js";

import PromptBuilder
    from "./api/ai/prompt-builder.js";

import GenerationEngine
    from "./api/ai/generation-engine.js";

import OpenRouterProvider
    from "./api/ai/providers/openrouter-provider.js";

import BuildManifestGenerator
    from "./api/workers/build-manifest-generator.js";

import ProjectWriter
    from "./api/project-writer/project-writer.js";

console.log("\n═══════════════════════════════════════════════");
console.log(" ANNEXE AI — REAL AI GENERATION TEST");
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

                title: "Create Login Component",

                description:
                    "Generate a React login component.",

                requirements: [

                    "Responsive",

                    "Accessible",

                    "Modern UI"

                ]

            },

            project: {

                name: "ANNEXE CRM",

                description:
                    "Enterprise CRM"

            },

            repository: {

                branch: "main",

                files: []

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
    // Prompt
    // ----------------------------------------------------------

    const promptBuilder =
        new PromptBuilder();

    const engineeringPrompt =
        promptBuilder.build(context);

    console.log("✅ Prompt Built");

    // ----------------------------------------------------------
    // AI Provider
    // ----------------------------------------------------------

    const provider =
        new OpenRouterProvider();

    const engine =
        new GenerationEngine({

            defaultProvider: "openrouter"

        });

    engine.registerProvider(

        "openrouter",

        provider

    );

    console.log("✅ Provider Registered");

    // ----------------------------------------------------------
    // AI Generation
    // ----------------------------------------------------------

    const generation =
        await engine.generate({

            engineeringPrompt

        });

    if (!generation.success) {

        throw new Error(

            generation.message ||

            "Generation failed."

        );

    }

    console.log("✅ AI Generation");

    // ----------------------------------------------------------
    // Build Manifest
    // ----------------------------------------------------------

    const manifestGenerator =
        new BuildManifestGenerator();

    const manifest =
        manifestGenerator.generate({

            projectId: "PROJECT-001",

            executionId: "EXEC-001",

            task: context.task,

            generatedBy: "OpenRouter",

            files:
                generation.generatedFiles

        });

    console.log("✅ Build Manifest");

    // ----------------------------------------------------------
    // Project Writer
    // ----------------------------------------------------------

    const writer =
        new ProjectWriter({

            workspaceRoot:
                "workspace"

        });

    const report =
        writer.write(manifest);

    console.log("✅ Project Writer");

    // ----------------------------------------------------------
    // Summary
    // ----------------------------------------------------------

    console.log("\n══════════════════════════════════════");
    console.log(" SOFTWARE FACTORY SUMMARY");
    console.log("══════════════════════════════════════");

    console.log("Provider:",
        generation.provider);

    console.log("Model:",
        generation.model);

    console.log("Files Generated:",
        generation.generatedFiles.length);

    console.log("Files Written:",
        report.filesWritten);

    console.log("Workspace:",
        `workspace/${manifest.projectId}`);

    console.log("\n🎉 FIRST REAL AI SOFTWARE GENERATION PASSED\n");

}
catch (error) {

    console.error("\n❌ REAL AI GENERATION FAILED\n");

    console.error(error);

    process.exit(1);

}