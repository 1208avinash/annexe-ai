import fs from "fs";
import path from "path";

import AIModel from "./lib/ai/model-router/ai-model.js";
import ModelRegistry from "./lib/ai/model-router/model-registry.js";
import ModelRouter from "./lib/ai/model-router/model-router.js";
import Provider from "./lib/ai/provider.js";
import ProviderRegistry from "./lib/ai/provider-registry.js";
import BusinessAnalyzer from "./lib/factory/business-analyzer.js";
import BlueprintValidator from "./lib/factory/blueprint-validator.js";
import ProjectExecutor from "./lib/factory/project-executor.js";
import SoftwareFactory from "./lib/factory/software-factory.js";
import TemplateCompiler from "./lib/factory/template-compiler.js";
import SoftwareArchitect from "./lib/architecture/software-architect.js";
import PlanningDecisionAdapter from "./lib/architecture/planning-decision-adapter.js";
import PlanningEngine from "./lib/planning-engine/planning-engine.js";
import WorkflowGenerator from "./lib/workflow/workflow-generator.js";
import WorkflowGraph from "./lib/engineering/workflow-graph.js";
import TaskScheduler from "./lib/engineering/task-scheduler.js";
import ParallelExecutor from "./lib/engineering/parallel-executor.js";
import EngineeringDirector from "./lib/engineering/engineering-director.js";
import ProjectWriter from "./lib/project-writer/project-writer.js";

const checks = [];
function check(label, condition, actual = null) {
    checks.push(condition);
    const icon = condition ? "OK" : "FAIL";
    console.log(`${icon} ${label}${condition ? "" : ` -> ${JSON.stringify(actual)}`}`);
}

const providerRegistry = new ProviderRegistry();
const modelRegistry = new ModelRegistry();
const provider = new Provider({
    providerId: "openrouter",
    name: "OpenRouter",
    status: "online",
    available: true
});
const model = new AIModel({
    modelId: "openrouter-gpt-5",
    provider: "openrouter",
    slug: "openai/gpt-5.5",
    displayName: "GPT-5.5",
    category: "chat",
    pricing: { type: "free", currency: "USD" },
    capabilities: {
        coding: 9,
        reasoning: 9,
        writing: 8,
        mathematics: 7,
        debugging: 8,
        planning: 8
    },
    features: {
        json: true,
        streaming: true,
        vision: false,
        tools: false,
        functionCalling: false
    },
    performance: {
        quality: 9,
        speed: 8,
        reliability: 9
    },
    status: "online",
    available: true,
    priority: 100
});

providerRegistry.register(provider);
modelRegistry.register(model);

const modelRouter = new ModelRouter(modelRegistry);
const selectedModel = modelRouter.select({
    taskType: "coding",
    requiresJson: true,
    freePreferred: true
});

check("Provider Registry", providerRegistry.count() === 1, providerRegistry.count());
check("Model Registry", modelRegistry.count() === 1, modelRegistry.count());
check("Model Router", Boolean(selectedModel), selectedModel);

const businessAnalyzer = new BusinessAnalyzer();
const templateCompiler = new TemplateCompiler();
const blueprintValidator = new BlueprintValidator();
const softwareArchitect = new SoftwareArchitect();
const engineeringDirector = new EngineeringDirector();
const planningDecisionAdapter = new PlanningDecisionAdapter();
const planningEngine = new PlanningEngine();
const workflowGenerator = new WorkflowGenerator();
const workflowGraph = new WorkflowGraph();
const taskScheduler = new TaskScheduler();
const parallelExecutor = new ParallelExecutor({ engineeringDirector });
const projectWriter = new ProjectWriter({
    workspaceRoot: path.join("workspace", "factory-health")
});

const request = {
    requestType: "buildSoftware",
    project: {
        projectId: "factory-health-crm",
        name: "Factory Health CRM",
        description: "Health check project for ANNEXE AI",
        industry: "CRM"
    },
    challenge: "Build an enterprise CRM",
    solution: "Generate a production-ready enterprise CRM scaffold",
    requirements: ["Authentication", "Dashboard", "Customers"]
};

const analysis = businessAnalyzer.analyze(request);
const blueprint = templateCompiler.compile({ request, businessAnalysis: analysis });
const blueprintCheck = blueprintValidator.validate(blueprint);
check("Template Compiler", Boolean(blueprint?.files?.length), blueprint?.files?.length);
check("Blueprint Validator", blueprintCheck.approved, blueprintCheck.errors);

const specification = softwareArchitect.createSpecification({
    project: request.project,
    businessAnalysis: analysis,
    engineeringPlan: blueprint.engineeringPlan
});
const planningDecision = planningDecisionAdapter.adapt(specification);
const plan = planningEngine.createPlan(planningDecision);
const workflow = workflowGenerator.generate(plan);
const graph = workflowGraph.build(workflow.tasks);
const schedule = taskScheduler.schedule({
    workflowId: workflow.workflowId,
    tasks: graph.getTasks()
});
const execution = await parallelExecutor.execute(schedule);
check("Engineering Director", Boolean(execution), execution);
check("Workflow Generator", Boolean(workflow?.workflowId), workflow?.workflowId);
check("Workflow Graph", graph.count() > 0, graph.count());
check("Task Scheduler", Array.isArray(schedule.batches) && schedule.batches.length > 0, schedule);
check("Parallel Executor", Boolean(execution?.completed), execution);

const projectExecutor = new ProjectExecutor({
    businessAnalyzer,
    templateCompiler,
    blueprintValidator,
    softwareArchitect,
    engineeringDirector,
    planningDecisionAdapter,
    planningEngine,
    workflowGenerator,
    workflowGraph,
    taskScheduler,
    parallelExecutor,
    projectWriter
});

const softwareFactory = new SoftwareFactory({ projectExecutor });

const result = await softwareFactory.buildSoftware(request);

check("SoftwareFactory", result.success === true, result);
check("ProjectExecutor", result.success === true, result);
check("ProjectWriter", result.report?.filesWritten > 0, result.report);
check(
    "Template Compiler output",
    fs.existsSync(path.join("workspace", "factory-health", "factory-health-crm")),
    null
);

const total = checks.length;
const passed = checks.filter(Boolean).length;
const readiness = Math.round((passed / total) * 100);

console.log(`Factory Readiness %: ${readiness}%`);

if (passed !== total) {
    process.exit(1);
}
