import UpgradeAnalyzerAgent from "./analysis/upgrade-analyzer-agent.js";
import ImpactAssessmentAgent from "./impact/impact-assessment-agent.js";
import UpgradePlannerAgent from "./planning/upgrade-planner-agent.js";
import UpgradePricingAgent from "./pricing/upgrade-pricing-agent.js";
import UpgradePaymentGateAgent from "./payment/upgrade-payment-gate-agent.js";
import UpgradeExecutionAgent from "./execution/upgrade-execution-agent.js";
import UpgradeValidationAgent from "./validation/upgrade-validation-agent.js";
import UpgradeReportGenerator from "./reports/upgrade-report-generator.js";

export default class UpgradeOrchestrator {
    constructor({
        upgradeAnalyzerAgent = new UpgradeAnalyzerAgent(),
        impactAssessmentAgent = new ImpactAssessmentAgent(),
        upgradePlannerAgent = new UpgradePlannerAgent(),
        upgradePricingAgent = new UpgradePricingAgent(),
        upgradePaymentGateAgent = new UpgradePaymentGateAgent(),
        upgradeExecutionAgent = new UpgradeExecutionAgent(),
        upgradeValidationAgent = new UpgradeValidationAgent(),
        reportGenerator = new UpgradeReportGenerator()
    } = {}) {
        this.upgradeAnalyzerAgent = upgradeAnalyzerAgent;
        this.impactAssessmentAgent = impactAssessmentAgent;
        this.upgradePlannerAgent = upgradePlannerAgent;
        this.upgradePricingAgent = upgradePricingAgent;
        this.upgradePaymentGateAgent = upgradePaymentGateAgent;
        this.upgradeExecutionAgent = upgradeExecutionAgent;
        this.upgradeValidationAgent = upgradeValidationAgent;
        this.reportGenerator = reportGenerator;
    }

    processRequest(input = {}) {
        const analysis = this.upgradeAnalyzerAgent.analyze(input);
        const impact = this.impactAssessmentAgent.assess({
            ...input,
            analysis
        });
        const plan = this.upgradePlannerAgent.plan({
            ...input,
            analysis,
            impact
        });
        const cost = this.upgradePricingAgent.estimate({
            ...input,
            analysis,
            impact,
            plan
        });
        const paymentGate = this.upgradePaymentGateAgent.createGate({
            ...input,
            cost
        });
        const execution = this.upgradeExecutionAgent.execute({
            ...input,
            analysis,
            impact,
            plan,
            cost,
            paymentGate
        });
        const validation = this.upgradeValidationAgent.validate({
            ...input,
            analysis,
            impact,
            plan,
            cost,
            paymentGate,
            execution
        });
        const report = this.reportGenerator.createReport({
            projectId: input.project?.projectId ?? null,
            requestText: input.requestText ?? "",
            analysis,
            impact,
            plan,
            cost,
            paymentGate,
            execution,
            validation
        });
        const persisted = this.reportGenerator.persist(report, input.projectRoot ?? null, {
            analysis,
            impact,
            plan,
            cost,
            paymentGate,
            execution,
            validation
        });

        return {
            analysis,
            impact,
            plan,
            cost,
            paymentGate,
            execution,
            validation,
            report: persisted.report,
            reportPaths: persisted.paths,
            reportPath: persisted.paths?.certification ?? null
        };
    }
}
