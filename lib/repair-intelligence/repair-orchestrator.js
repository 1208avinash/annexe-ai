import SystemInspector from "./system-inspector.js";
import DiagnosisEngine from "./diagnosis-engine.js";
import RootCauseAnalyzer from "./root-cause-analyzer.js";
import RepairPlanner from "./repair-planner.js";
import RepairEstimator from "./repair-estimator.js";
import RepairExecutor from "./repair-executor.js";
import RepairValidator from "./repair-validator.js";
import RepairReport from "./repair-report.js";

function normalizeText(value) {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim();
}

export default class RepairOrchestrator {
    constructor({
        systemInspector = new SystemInspector(),
        diagnosisEngine = new DiagnosisEngine(),
        rootCauseAnalyzer = new RootCauseAnalyzer(),
        repairPlanner = new RepairPlanner(),
        repairEstimator = new RepairEstimator(),
        repairExecutor = new RepairExecutor(),
        repairValidator = new RepairValidator(),
        repairReport = new RepairReport()
    } = {}) {
        this.systemInspector = systemInspector;
        this.diagnosisEngine = diagnosisEngine;
        this.rootCauseAnalyzer = rootCauseAnalyzer;
        this.repairPlanner = repairPlanner;
        this.repairEstimator = repairEstimator;
        this.repairExecutor = repairExecutor;
        this.repairValidator = repairValidator;
        this.repairReport = repairReport;
    }

    async processRequest(input = {}) {
        const requestText = normalizeText(
            input.requestText ??
            input.customerIntelligence?.requestText ??
            ""
        );
        const projectRoot = input.projectRoot ?? input.project?.projectRoot ?? null;
        const system = this.systemInspector.inspect({
            projectRoot,
            project: input.project ?? null
        });
        const diagnosis = this.diagnosisEngine.diagnose({
            requestText,
            customerClassification: input.customerIntelligence?.classification ?? null,
            system
        });
        const rootCause = this.rootCauseAnalyzer.analyze({
            requestText,
            diagnosis,
            system
        });
        const repairPlan = this.repairPlanner.plan({
            diagnosis,
            rootCause,
            system
        });
        const estimate = this.repairEstimator.estimate({
            projectId: input.project?.projectId ?? null,
            proposalId: input.customerIntelligence?.report?.reportId ?? null,
            costEstimate: repairPlan.costEstimate,
            currency: input.currency ?? "USD"
        });
        const execution = await this.repairExecutor.execute({
            requestText,
            issue: input.issue ?? requestText,
            project: input.project ?? null,
            diagnosis,
            rootCause,
            repairPlan,
            system
        });
        const validation = this.repairValidator.validate({
            projectRoot,
            impactedFiles: rootCause.impactedFiles,
            issueDetected: true,
            repairPlan,
            paymentGateCreated: estimate.paymentGateCreated
        });
        const report = this.repairReport.create({
            projectId: input.project?.projectId ?? null,
            issueDetected: true,
            diagnosis,
            rootCause,
            repairPlan,
            estimate,
            execution,
            validation
        });
        const persisted = this.repairReport.persist(report, projectRoot);

        return {
            issueDetected: true,
            requestText,
            system,
            diagnosis,
            rootCause,
            repairPlan,
            estimate,
            execution,
            validation,
            report: persisted.report,
            reportPaths: persisted.paths,
            paymentGate: estimate.paymentGate,
            paymentGateCreated: estimate.paymentGateCreated
        };
    }
}
