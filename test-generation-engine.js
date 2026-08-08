// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 13.3
// Generation Engine Test
// EngineeringPrompt → GenerationEngine → Mock Provider
// ───────────────────────────────────────────────────────────────

import GenerationEngine
    from "./lib/ai/generation-engine.js";

import EngineeringPrompt
    from "./lib/ai/contracts/engineering-prompt.js";

import GenerationResult
    from "./lib/ai/contracts/generation-result.js";

console.log("\n═══════════════════════════════════════════════");
console.log(" ANNEXE AI — Generation Engine Test");
console.log("═══════════════════════════════════════════════\n");

try {

    // ----------------------------------------------------------
    // Mock Provider
    // ----------------------------------------------------------

    const mockProvider = {

        async generate(prompt) {

            return new GenerationResult({

                provider: "Mock Provider",

                model: "mock-model-v1",

                success: true,

                status: "completed",

                generatedFiles: [

                    {

                        path:
                            "frontend/src/pages/Login.jsx",

                        language:
                            "javascript",

                        type:
                            "react-component",

                        content:
`export default function Login() {
    return <div>Login</div>;
}`

                    },

                    {

                        path:
                            "frontend/src/pages/Login.css",

                        language:
                            "css",

                        type:
                            "stylesheet",

                        content:
`.login {
    display: flex;
}`

                    }

                ],

                usage: {

                    promptTokens: 120,

                    completionTokens: 240,

                    totalTokens: 360

                },

                latencyMs: 42,

                rawResponse: {

                    mock: true

                }

            });

        }

    };

    // ----------------------------------------------------------
    // Engine
    // ----------------------------------------------------------

    const engine =
        new GenerationEngine({

            defaultProvider:
                "mock"

        });

    engine.registerProvider(

        "mock",

        mockProvider

    );

    // ----------------------------------------------------------
    // Prompt
    // ----------------------------------------------------------

    const engineeringPrompt =
        new EngineeringPrompt({

            systemInstructions:
                "Generate production-ready React code.",

            prompt:
                "Create Login.jsx and Login.css"

        });

    // ----------------------------------------------------------
    // Execute
    // ----------------------------------------------------------

    const result =
        await engine.generate({

            engineeringPrompt

        });

    // ----------------------------------------------------------
    // Validation
    // ----------------------------------------------------------

    if (!result)
        throw new Error("GenerationResult missing.");

    if (!result.success)
        throw new Error("Generation failed.");

    if (result.generatedFiles.length !== 2)
        throw new Error("Expected 2 generated files.");

    console.log("✅ Provider Registered");
    console.log("✅ Generation Executed");
    console.log("✅ Generation Result");

    // ----------------------------------------------------------
    // Summary
    // ----------------------------------------------------------

    console.log("\n══════════════════════════════════════");
    console.log(" GENERATION SUMMARY");
    console.log("══════════════════════════════════════");

    console.log("Provider:",
        result.provider);

    console.log("Model:",
        result.model);

    console.log("Generated Files:",
        result.generatedFiles.length);

    console.log("Prompt Tokens:",
        result.usage.promptTokens);

    console.log("Completion Tokens:",
        result.usage.completionTokens);

    console.log("Latency:",
        `${result.latencyMs} ms`);

    console.log("\nFiles:");

    for (const file of result.generatedFiles) {

        console.log(`  • ${file.path}`);

    }

    console.log("\n🎉 GENERATION ENGINE PASSED\n");

}
catch (error) {

    console.error("\n❌ GENERATION ENGINE FAILED\n");

    console.error(error);

    process.exit(1);

}