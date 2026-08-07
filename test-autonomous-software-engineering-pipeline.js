// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 16
// Autonomous Software Engineering Pipeline Test
// End-to-End System Validation
// ───────────────────────────────────────────────────────────────

import SoftwareArchitect
    from "./api/architecture/software-architect.js";

import EngineeringDirector
    from "./api/engineering/engineering-director.js";

import PlanningEngine
    from "./api/planning-engine/planning-engine.js";

import WorkflowGenerator
    from "./api/workflow/workflow-generator.js";

import ExecutionEngine
    from "./api/execution/execution-engine.js";

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

import PlanningDecisionAdapter
    from "./api/architecture/planning-decision-adapter.js";



console.log("\n═══════════════════════════════════════════════");
console.log(" ANNEXE AI — AUTONOMOUS SOFTWARE ENGINEERING");
console.log("═══════════════════════════════════════════════\n");

try {

    // ==========================================================
    // Customer Request
    // ==========================================================

    const customerRequest = {

        project: {

            projectId:
                "PROJECT-001",

            name:
                "ANNEXE CRM",

            description:
                "Enterprise CRM"

        },

        businessAnalysis: {

            industry:
                "CRM",

            businessGoals: [

                "Customer Management",

                "Authentication",

                "Reporting"

            ]

        }

    };

    console.log("✅ Customer Requirement");

    // ==========================================================
    // Engineering Plan
    // ==========================================================

    const engineeringPlan = {

        projectType:
            "Web Application",

        frontend:
            "React 19",

        backend:
            "FastAPI",

        database:
            "PostgreSQL",

        deployment:
            "Docker",

        functionalRequirements: [

            "Authentication",

            "Dashboard",

            "Customers"

        ],

        nonFunctionalRequirements: [

            "Scalable",

            "Secure"

        ],

        frontendModules: [

            "Login",

            "Dashboard"

        ],

        backendServices: [

            "Auth API",

            "Customer API"

        ],

        entities: [

            "Users",

            "Customers"

        ],

        endpoints: [

            "/login",

            "/customers"

        ],

        authentication:
            "JWT",

        authorization:
            "RBAC",

        securityRequirements: [

            "BCrypt",

            "Rate Limiting"

        ],

        acceptanceCriteria: [

            "Authentication works",

            "Dashboard loads"

        ]

    };

    // ==========================================================
    // Software Architect
    // ==========================================================

    const architect =
        new SoftwareArchitect();

    const specification =
        architect.createSpecification({

            project:
                customerRequest.project,

            businessAnalysis:
                customerRequest.businessAnalysis,

            engineeringPlan

        });

    console.log("✅ Engineering Specification");

    // ==========================================================
    // Engineering Director
    // ==========================================================

    const director =
        new EngineeringDirector();

    const executionPlan =
        director.createExecutionPlan(
            specification
        );

    console.log("✅ Execution Plan");

// ==========================================================
// Planning
// ==========================================================

const adapter =
    new PlanningDecisionAdapter();

const decision =
    adapter.adapt(
        specification
    );

const planner =
    new PlanningEngine();

const plan =
    planner.createPlan(
        decision
    );

console.log(
    "Engineering Tasks:",
    plan.engineeringTasks.length
);

console.log("✅ Engineering Plan");


    // ==========================================================
// Workflow
// ==========================================================

const workflowGenerator =
    new WorkflowGenerator();

const workflow =
    workflowGenerator.generate(
        plan
    );

console.log(
    "Pending Tasks:",
    workflow.pendingTasks.length
);

console.log("✅ Workflow");


// ==========================================================
// Execution
// ==========================================================

const executionEngine =
    new ExecutionEngine();

const execution =
    executionEngine.start(
        workflow
    );

console.log("✅ Execution");


    // ==========================================================
    // Context
    // ==========================================================

    const contextBuilder =
        new EngineeringContextBuilder();

    const context =
        contextBuilder.build({

            engineeringPlan:
                plan,

            executionState:
                execution,

            task:
                execution.currentTask,

            project:
                customerRequest.project,

            repository: {

                branch: "main",

                files: []

            },

            standards: {

                language:
                    "TypeScript",

                framework:
                    "React"

            }

        });

    console.log("✅ Engineering Context");

    // ==========================================================
    // Prompt
    // ==========================================================

    const promptBuilder =
        new PromptBuilder();

    const prompt =
        promptBuilder.build(context);

    console.log("✅ Prompt");

    // ==========================================================
// AI Generation
// ==========================================================

const provider =
    new OpenRouterProvider();

const generationEngine =
    new GenerationEngine({

        defaultProvider:
            "openrouter"

    });

generationEngine.registerProvider(

    "openrouter",

    provider

);

let generation;

try {

    generation =
        await generationEngine.generate({

            engineeringPrompt:
                prompt

        });

}
catch (error) {

    console.error("\n══════════════════════════════════════");
    console.error(" GENERATION ENGINE EXCEPTION");
    console.error("══════════════════════════════════════\n");

    console.error(error);

    if (error?.stack)
        console.error(error.stack);

    throw error;

}

console.log("\n══════════════════════════════════════");
console.log(" GENERATION RESULT");
console.log("══════════════════════════════════════");

console.dir(
    generation,
    { depth: null }
);

if (!generation.success)
    throw new Error(
        generation.message
    );

console.log("✅ AI Generation");

    // ==========================================================
    // Manifest
    // ==========================================================

    const manifestGenerator =
        new BuildManifestGenerator();

    const manifest =
        manifestGenerator.generate({

            projectId:
                customerRequest.project.projectId,

            executionId:
                execution.executionId,

            task:
                execution.currentTask,

            generatedBy:
                "OpenRouter",

            files:
                generation.generatedFiles

        });

    console.log("✅ Build Manifest");

    // ==========================================================
    // Project Writer
    // ==========================================================

    const writer =
        new ProjectWriter({

            workspaceRoot:
                "workspace"

        });

    const report =
        writer.write(manifest);

    console.log("✅ Project Writer");

    // ==========================================================
    // Summary
    // ==========================================================

    console.log("\n══════════════════════════════════════");
    console.log(" SOFTWARE FACTORY SUMMARY");
    console.log("══════════════════════════════════════");

    console.log(
        "Specification:",
        specification.specificationId
    );

    console.log(
        "Execution Plan:",
        executionPlan.executionPlanId
    );

    console.log(
        "Engineering Plan:",
        plan.planId
    );

    console.log(
        "Workflow:",
        workflow.workflowId
    );

    console.log(
        "Execution:",
        execution.executionId
    );

    console.log(
        "Generated Files:",
        generation.generatedFiles.length
    );

    console.log(
        "Files Written:",
        report.filesWritten
    );

    console.log(
        "Workspace:",
        `workspace/${customerRequest.project.projectId}`
    );

    console.log(
        "\n🏆 AUTONOMOUS SOFTWARE ENGINEERING PIPELINE PASSED\n"
    );

}
catch (error) {

    console.error(
        "\n❌ AUTONOMOUS SOFTWARE ENGINEERING PIPELINE FAILED\n"
    );

    console.error(error);

    process.exit(1);

}