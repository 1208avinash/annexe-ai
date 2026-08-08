// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 18.8
// Engineering Director V2 Test
// Autonomous Engineering Validation
// ───────────────────────────────────────────────────────────────

import EngineerRegistry
    from "./lib/engineering/engineer-registry.js";

import EngineeringDirectorV2
    from "./lib/engineering/engineering-director-v2.js";

import EngineeringTask
    from "./lib/engineering/contracts/engineering-task.js";

import FrontendEngineer
    from "./lib/engineering/agents/frontend-engineer.js";

console.log("\n═══════════════════════════════════════════════");
console.log(" ANNEXE AI — ENGINEERING DIRECTOR TEST");
console.log("═══════════════════════════════════════════════\n");

try {

    // ==========================================================
    // Registry
    // ==========================================================

    const registry =
        new EngineerRegistry();

    // ==========================================================
    // Mock Engineer
    // ==========================================================

    const engineer =
        new FrontendEngineer({});

    engineer.execute =
        async task => ({

            success: true,

            generatedFiles: [

                {

                    path:
                        "frontend/App.jsx",

                    content:
                        "<App />"

                }

            ]

        });

    registry.register(
        engineer
    );

    console.log("✅ Engineer Registry");

    // ==========================================================
    // Director
    // ==========================================================

    const director =
        new EngineeringDirectorV2({

            engineerRegistry:
                registry

        });

    console.log("✅ Engineering Director");

    // ==========================================================
    // Workflow
    // ==========================================================

    const workflow = {

        workflowId:
            "WF-001",

        tasks: [

            new EngineeringTask({

                title:
                    "React Dashboard",

                description:
                    "Create dashboard",

                category:
                    "React",

                requiredRole:
                    "Frontend Engineer"

            })

        ]

    };

    console.log("✅ Workflow");

    // ==========================================================
    // Execute
    // ==========================================================

    const result =
        await director.execute(
            workflow
        );

    console.log("✅ Workflow Executed");

    // ==========================================================
    // Assertions
    // ==========================================================

    if (
        result.completed !== 1
    )

        throw new Error(
            "Task execution failed."
        );

    // ==========================================================
    // Summary
    // ==========================================================

    console.log("\n══════════════════════════════════════");

    console.log(" ENGINEERING SUMMARY");

    console.log("══════════════════════════════════════");

    console.log(
        "Engineers:",
        registry.count()
    );

    console.log(
        "Tasks:",
        workflow.tasks.length
    );

    console.log(
        "Completed:",
        result.completed
    );

    console.log(
        "Selected Engineer:",
        result.results[0].engineer
    );

    console.log(
        "\n🏆 ENGINEERING DIRECTOR PASSED\n"
    );

}
catch (error) {

    console.error(
        "\n❌ ENGINEERING DIRECTOR FAILED\n"
    );

    console.error(error);

    process.exit(1);

}