// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 20.4
// Project Executor
// Executes Complete Software Projects
// ───────────────────────────────────────────────────────────────

import path from "path";

import Executor from "./executor.js";
import PlanningDecisionAdapter from "../architecture/planning-decision-adapter.js";

export default class ProjectExecutor extends Executor {

    constructor({
        businessAnalyzer,
        templateCompiler,
        blueprintValidator,
        softwareArchitect,
        engineeringDirector,
        planningDecisionAdapter = new PlanningDecisionAdapter(),
        planningEngine,
        workflowGenerator,
        workflowGraph,
        taskScheduler,
        parallelExecutor,
        projectWriter
    }) {

        super();

        if (!businessAnalyzer)
            throw new Error("BusinessAnalyzer is required.");

        if (!templateCompiler)
            throw new Error("TemplateCompiler is required.");

        if (!blueprintValidator)
            throw new Error("BlueprintValidator is required.");

        if (!softwareArchitect)
            throw new Error("SoftwareArchitect is required.");

        if (!engineeringDirector)
            throw new Error("EngineeringDirector is required.");

        if (!planningEngine)
            throw new Error("PlanningEngine is required.");

        if (!workflowGenerator)
            throw new Error("WorkflowGenerator is required.");

        if (!workflowGraph)
            throw new Error("WorkflowGraph is required.");

        if (!taskScheduler)
            throw new Error("TaskScheduler is required.");

        if (!parallelExecutor)
            throw new Error("ParallelExecutor is required.");

        if (!projectWriter)
            throw new Error("ProjectWriter is required.");

        this.businessAnalyzer = businessAnalyzer;
        this.templateCompiler = templateCompiler;
        this.blueprintValidator = blueprintValidator;
        this.softwareArchitect = softwareArchitect;
        this.engineeringDirector = engineeringDirector;
        this.planningDecisionAdapter = planningDecisionAdapter;
        this.planningEngine = planningEngine;
        this.workflowGenerator = workflowGenerator;
        this.workflowGraph = workflowGraph;
        this.taskScheduler = taskScheduler;
        this.parallelExecutor = parallelExecutor;
        this.projectWriter = projectWriter;

    }

    async execute(request) {

        this.validateRequest(request);

        const started = Date.now();

        try {

            const analysis = this.businessAnalyzer.analyze(request);

            const blueprint = this.templateCompiler.compile({
                request,
                businessAnalysis: analysis
            });

            const blueprintValidation = this.blueprintValidator.validate(blueprint);

            if (!blueprintValidation.approved) {
                throw new Error(
                    `Blueprint validation failed: ${blueprintValidation.errors.join(", ")}`
                );
            }

            const specification = this.softwareArchitect.createSpecification({
                project: request.project,
                businessAnalysis: analysis,
                engineeringPlan: blueprint.engineeringPlan
            });

            const planningDecision = this.planningDecisionAdapter.adapt(specification);

            const plan = this.planningEngine.createPlan(planningDecision);

            const workflow = this.workflowGenerator.generate(plan);

            const graph = this.workflowGraph.build(
                workflow.tasks ?? plan.engineeringTasks ?? []
            );

            if (graph.hasCircularDependency()) {
                throw new Error("Circular dependency detected.");
            }

            const schedule = this.taskScheduler.schedule({
                workflowId: workflow.workflowId,
                tasks: graph.getTasks()
            });

            const execution = await this.parallelExecutor.execute(schedule);

            const projectId =
                request.project.projectId ??
                request.project.id ??
                `PROJECT-${Date.now()}`;

            const summaryFile = {
                path: "enterprise-crm-summary.json",
                type: "artifact",
                language: "json",
                content: JSON.stringify(
                    {
                        projectId,
                        analysis,
                        specificationId: specification.specificationId,
                        planId: plan.planId,
                        workflowId: workflow.workflowId,
                        schedule,
                        execution
                    },
                    null,
                    2
                )
            };

            const manifest = {
                manifestId: `MANIFEST-${Date.now()}`,
                projectId,
                executionId: `EXEC-${Date.now()}`,
                taskId: plan.planId,
                generatedBy: "ANNEXE AI",
                blueprint,
                artifacts: [...(blueprint.files ?? []), summaryFile]
            };

            const report = this.projectWriter.write(manifest);

            return this.success({
                request,
                analysis,
                blueprint,
                blueprintValidation,
                specification,
                planningDecision,
                plan,
                workflow,
                graph,
                schedule,
                execution,
                report,
                project: {
                    ...request.project,
                    projectId,
                    analysis,
                    specificationId: specification.specificationId,
                    planId: plan.planId,
                    workflowId: workflow.workflowId,
                    outputDirectory: path.join(
                        this.projectWriter.workspaceRoot ?? "workspace",
                        projectId
                    )
                },
                pipeline: {
                    blueprintStatus: blueprintValidation.approved ? "completed" : "failed",
                    planStatus: "completed",
                    workflowStatus: "completed",
                    executionStatus: "completed",
                    finalStatus: report.success ? "completed" : "failed"
                },
                durationMs: Date.now() - started
            });

        }
        catch (error) {

            return this.failure({
                request,
                error,
                durationMs: Date.now() - started
            });

        }

    }

}
