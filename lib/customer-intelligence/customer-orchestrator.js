import ClientRequestAnalyzer from "./client-request-analyzer.js";
import ComplaintClassifier from "./complaint-classifier.js";
import PriorityEngine from "./priority-engine.js";
import DepartmentRouter from "./department-router.js";
import CustomerMemory from "./customer-memory.js";
import CustomerServiceReport from "./customer-service-report.js";

export default class CustomerOrchestrator {
    constructor({
        analyzer = new ClientRequestAnalyzer(),
        classifier = new ComplaintClassifier(),
        priorityEngine = new PriorityEngine(),
        departmentRouter = new DepartmentRouter(),
        memory = new CustomerMemory(),
        reportBuilder = new CustomerServiceReport()
    } = {}) {
        this.analyzer = analyzer;
        this.classifier = classifier;
        this.priorityEngine = priorityEngine;
        this.departmentRouter = departmentRouter;
        this.memory = memory;
        this.reportBuilder = reportBuilder;
    }

    processRequest(input = {}) {
        const analysis = this.analyzer.analyze(input);
        const classification = this.classifier.classify(analysis);
        const priority = this.priorityEngine.assignPriority({
            classification,
            signals: analysis.signals,
            text: analysis.requestText
        });
        const department = this.departmentRouter.route({
            classification,
            analysis,
            requestText: analysis.requestText
        });
        const report = this.reportBuilder.create({
            requestText: analysis.requestText,
            customer: analysis.customer,
            project: analysis.project,
            receivedAt: analysis.receivedAt,
            classification,
            priority: priority.priority,
            assignedDepartment: department.department,
            signals: analysis.signals
        });
        const memoryEntry = this.memory.remember({
            requestText: analysis.requestText,
            classification,
            priority: priority.priority,
            assignedDepartment: department.department,
            reportId: report.reportId
        });

        return {
            requestText: analysis.requestText,
            analysis,
            classification,
            priority: priority.priority,
            priorityDetails: priority,
            assignedDepartment: department.department,
            departmentDetails: department,
            actionPlan: report.actionPlan,
            report,
            memory: memoryEntry
        };
    }
}
