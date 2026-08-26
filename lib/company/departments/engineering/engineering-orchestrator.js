import FrontendEngineerAgent from "./frontend/frontend-engineer-agent.js";
import BackendEngineerAgent from "./backend/backend-engineer-agent.js";
import DatabaseEngineerAgent from "./database/database-engineer-agent.js";
import AIEngineerAgent from "./ai/ai-engineer-agent.js";
import IntegrationEngineerAgent from "./integration/integration-engineer-agent.js";
import CodeReviewAgent from "./review/code-review-agent.js";
import PerformanceEngineerAgent from "./optimization/performance-engineer-agent.js";
import EngineeringReportGenerator from "./reports/engineering-report-generator.js";
import EngineeringDirector from "../../../engineering/engineering-director.js";
import WorkflowGenerator from "../../../workflow/workflow-generator.js";
import WorkflowGraph from "../../../engineering/workflow-graph.js";
import TaskScheduler from "../../../engineering/task-scheduler.js";
import ParallelExecutor from "../../../engineering/parallel-executor.js";

function buildEngineeringSpecification(input = {}) {
    const architecture = input.architectureDepartment ?? {};
    const product = input.productDepartment ?? {};

    return {
        specificationId: `ENGSPEC-${Date.now()}`,
        project: {
            id: input.project?.projectId ?? "engineering-project",
            name: input.project?.name ?? "Engineering Project",
            description: input.requestText ?? ""
        },
        frontend: {
            framework: "React",
            modules: product.userStories?.length ? product.userStories.map(story => story.feature) : ["Dashboard", "Customer Management"]
        },
        backend: {
            framework: "FastAPI",
            services: architecture.solution?.serviceBoundaries ?? ["Identity", "Customer Operations"]
        },
        database: {
            engine: architecture.database?.databaseRecommendation ?? "PostgreSQL",
            entities: ["users", "customers", "activities", "reports"]
        },
        api: {
            style: "REST",
            endpoints: [
                "/health",
                "/auth/login",
                "/customers",
                "/dashboard"
            ]
        },
        integrations: architecture.integration?.integrationMap ?? [],
        security: {
            authentication: "JWT",
            authorization: "RBAC",
            requirements: architecture.security?.securityArchitecture ?? []
        },
        testing: {
            unit: true,
            integration: true,
            e2e: true
        },
        deployment: {
            platform: architecture.cloud?.cloudRecommendation ?? "AWS",
            strategy: "Containerized deployment"
        },
        constraints: [
            "Reuse existing factory contracts",
            "Avoid duplicate engineering execution systems"
        ],
        risks: architecture.scaling?.optimizationPlan ?? [],
        assumptions: [
            "Architecture and product requirements are approved.",
            "Engineering should focus on implementation quality and execution planning."
        ],
        acceptanceCriteria: [
            "Frontend and backend plans generated",
            "Database and integration plans generated",
            "AI and performance plans generated"
        ],
        successMetrics: [
            "Implementation plan completeness",
            "Quality review readiness",
            "Performance readiness"
        ]
    };
}

function buildEngineeringTasks(plans = {}) {
    const tasks = [];
    const sections = [
        ["frontend", plans.frontendPlan, "Frontend implementation"],
        ["backend", plans.backendPlan, "Backend implementation"],
        ["database", plans.databasePlan, "Database implementation"],
        ["ai", plans.aiPlan, "AI workflows implementation"],
        ["integration", plans.integrationPlan, "Integration implementation"]
    ];

    for (const [prefix, plan, label] of sections) {
        const entries = Array.isArray(plan?.uiComponents)
            ? plan.uiComponents
            : Array.isArray(plan?.apis)
                ? plan.apis
                : Array.isArray(plan?.schemas)
                    ? plan.schemas
                    : Array.isArray(plan?.aiWorkflows)
                        ? plan.aiWorkflows
                        : Array.isArray(plan?.paymentSystems)
                            ? plan.paymentSystems
                            : [];

        for (const [index, entry] of entries.entries()) {
            tasks.push({
                taskId: `${prefix.toUpperCase()}-TASK-${String(index + 1).padStart(3, "0")}`,
                name: `${label}: ${entry}`,
                dependencies: []
            });
        }
    }

    if (tasks.length === 0) {
        tasks.push({
            taskId: "ENG-TASK-001",
            name: "Baseline engineering task",
            dependencies: []
        });
    }

    return tasks;
}

export default class EngineeringOrchestrator {
    constructor({
        frontendEngineer = new FrontendEngineerAgent(),
        backendEngineer = new BackendEngineerAgent(),
        databaseEngineer = new DatabaseEngineerAgent(),
        aiEngineer = new AIEngineerAgent(),
        integrationEngineer = new IntegrationEngineerAgent(),
        codeReviewAgent = new CodeReviewAgent(),
        performanceEngineer = new PerformanceEngineerAgent(),
        reportGenerator = new EngineeringReportGenerator(),
        engineeringDirector = new EngineeringDirector(),
        workflowGenerator = new WorkflowGenerator(),
        workflowGraph = new WorkflowGraph(),
        taskScheduler = new TaskScheduler(),
        parallelExecutor = null
    } = {}) {
        this.frontendEngineer = frontendEngineer;
        this.backendEngineer = backendEngineer;
        this.databaseEngineer = databaseEngineer;
        this.aiEngineer = aiEngineer;
        this.integrationEngineer = integrationEngineer;
        this.codeReviewAgent = codeReviewAgent;
        this.performanceEngineer = performanceEngineer;
        this.reportGenerator = reportGenerator;
        this.engineeringDirector = engineeringDirector;
        this.workflowGenerator = workflowGenerator;
        this.workflowGraph = workflowGraph;
        this.taskScheduler = taskScheduler;
        this.parallelExecutor = parallelExecutor ?? new ParallelExecutor({ engineeringDirector });
    }

    async processRequest(input = {}) {
        const frontendPlan = this.frontendEngineer.generate(input);
        const backendPlan = this.backendEngineer.generate(input);
        const databasePlan = this.databaseEngineer.generate(input);
        const aiPlan = this.aiEngineer.generate(input);
        const integrationPlan = this.integrationEngineer.generate(input);
        const reviewResults = this.codeReviewAgent.review(input);
        const performanceAnalysis = this.performanceEngineer.analyze(input);

        const engineeringSpecification = buildEngineeringSpecification({
            ...input,
            plans: { frontendPlan, backendPlan, databasePlan, aiPlan, integrationPlan }
        });

        const executionPlan = this.engineeringDirector.createExecutionPlan(engineeringSpecification);
        const workflow = this.workflowGenerator.generate({
            planId: executionPlan.executionPlanId,
            projectId: engineeringSpecification.project.id,
            engineeringTasks: buildEngineeringTasks({
                frontendPlan,
                backendPlan,
                databasePlan,
                aiPlan,
                integrationPlan
            })
        });
        const graph = this.workflowGraph.build(workflow.tasks ?? []);
        const schedule = this.taskScheduler.schedule({
            workflowId: workflow.workflowId,
            tasks: graph.getTasks()
        });
        const execution = await this.parallelExecutor.execute(schedule);

        const report = this.reportGenerator.createReport({
            projectId: engineeringSpecification.project.id,
            assignedEngineers: [
                "Frontend Engineer",
                "Backend Engineer",
                "Database Engineer",
                "AI Engineer",
                "Integration Engineer",
                "Code Review Engineer",
                "Performance Engineer"
            ],
            implementationPlans: {
                frontend: frontendPlan,
                backend: backendPlan,
                database: databasePlan,
                ai: aiPlan,
                integration: integrationPlan
            },
            reviewResults,
            performanceAnalysis,
            recommendations: [
                "Implement according to the approved architecture blueprint.",
                "Preserve reusable service boundaries.",
                "Optimize performance and code quality before release."
            ],
            confidenceScore: 95
        });
        const persisted = this.reportGenerator.persist(report, input.projectRoot ?? null);

        return {
            frontendPlan,
            backendPlan,
            databasePlan,
            aiPlan,
            integrationPlan,
            reviewResults,
            performanceAnalysis,
            engineeringSpecification,
            executionPlan,
            workflow,
            workflowGraph: {
                count: graph.count(),
                hasCircularDependency: graph.hasCircularDependency()
            },
            schedule,
            execution,
            report: persisted.report,
            reportPath: persisted.path
        };
    }
}
