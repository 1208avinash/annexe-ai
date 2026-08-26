import EngineeringDirector from "../engineering/engineering-director.js";
import WorkflowGenerator from "../workflow/workflow-generator.js";
import WorkflowGraph from "../engineering/workflow-graph.js";
import TaskScheduler from "../engineering/task-scheduler.js";
import ParallelExecutor from "../engineering/parallel-executor.js";

function buildRepairSpecification(input = {}) {
    const issue = input.issue ?? {};
    const project = input.project ?? {};
    const components = input.diagnosis?.affectedComponents ?? [];

    return {
        specificationId: `REPAIR-SPEC-${Date.now()}`,
        project: {
            id: project.projectId ?? input.projectId ?? "repair-project",
            name: project.name ?? "Repair Project",
            description: input.requestText ?? "Repair execution"
        },
        backend: {
            services: components.includes("authentication") || components.includes("auth") ? ["Authentication Fix Service"] : ["Repair Service"]
        },
        frontend: {
            modules: components.includes("dashboard") ? ["Dashboard Recovery"] : ["Repair Console"]
        },
        database: {
            entities: ["repair_logs", "incident_records"]
        },
        testing: {
            unit: true,
            integration: true,
            e2e: true
        },
        deployment: {
            platform: "workspace"
        },
        issue
    };
}

function buildEngineeringTasks(plan = {}) {
    return (plan.repairSteps ?? []).map((step, index) => ({
        taskId: `REPAIR-TASK-${String(index + 1).padStart(3, "0")}`,
        name: step,
        dependencies: index === 0 ? [] : [`REPAIR-TASK-${String(index).padStart(3, "0")}`]
    }));
}

export default class RepairExecutor {
    constructor({
        engineeringDirector = new EngineeringDirector(),
        workflowGenerator = new WorkflowGenerator(),
        workflowGraph = new WorkflowGraph(),
        taskScheduler = new TaskScheduler(),
        parallelExecutor = null
    } = {}) {
        this.engineeringDirector = engineeringDirector;
        this.workflowGenerator = workflowGenerator;
        this.workflowGraph = workflowGraph;
        this.taskScheduler = taskScheduler;
        this.parallelExecutor = parallelExecutor ?? new ParallelExecutor({ engineeringDirector });
    }

    async execute(input = {}) {
        const specification = buildRepairSpecification(input);
        const executionPlan = this.engineeringDirector.createExecutionPlan(specification);
        const repairTasks = buildEngineeringTasks(input.repairPlan ?? {});
        const workflow = this.workflowGenerator.generate({
            planId: executionPlan.executionPlanId,
            projectId: specification.project.id,
            engineeringTasks: repairTasks
        });
        const graph = this.workflowGraph.build(workflow.tasks ?? []);
        const schedule = this.taskScheduler.schedule({
            workflowId: workflow.workflowId,
            tasks: graph.getTasks()
        });
        const execution = await this.parallelExecutor.execute(schedule);

        return {
            success: true,
            executionPlan,
            workflow,
            graph: {
                count: graph.count(),
                hasCircularDependency: graph.hasCircularDependency()
            },
            schedule,
            execution,
            connectedToEngineeringWorkflow: true
        };
    }
}
