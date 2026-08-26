import FunctionalTestingAgent from "./functional/functional-testing-agent.js";
import ApiTestingAgent from "./api/api-testing-agent.js";
import SecurityTestingAgent from "./security/security-testing-agent.js";
import PerformanceTestingAgent from "./performance/performance-testing-agent.js";
import AccessibilityTestingAgent from "./accessibility/accessibility-testing-agent.js";
import RegressionTestingAgent from "./regression/regression-testing-agent.js";
import ReleaseApprovalAgent from "./release/release-approval-agent.js";
import QAReportGenerator from "./reports/qa-report-generator.js";

export default class QAOrchestrator {
    constructor({
        functionalTestingAgent = new FunctionalTestingAgent(),
        apiTestingAgent = new ApiTestingAgent(),
        securityTestingAgent = new SecurityTestingAgent(),
        performanceTestingAgent = new PerformanceTestingAgent(),
        accessibilityTestingAgent = new AccessibilityTestingAgent(),
        regressionTestingAgent = new RegressionTestingAgent(),
        releaseApprovalAgent = new ReleaseApprovalAgent(),
        reportGenerator = new QAReportGenerator()
    } = {}) {
        this.functionalTestingAgent = functionalTestingAgent;
        this.apiTestingAgent = apiTestingAgent;
        this.securityTestingAgent = securityTestingAgent;
        this.performanceTestingAgent = performanceTestingAgent;
        this.accessibilityTestingAgent = accessibilityTestingAgent;
        this.regressionTestingAgent = regressionTestingAgent;
        this.releaseApprovalAgent = releaseApprovalAgent;
        this.reportGenerator = reportGenerator;
    }

    processRequest(input = {}) {
        const functional = this.functionalTestingAgent.test(input);
        const api = this.apiTestingAgent.test(input);
        const security = this.securityTestingAgent.test({
            ...input,
            qaResults: input.qaResults
        });
        const performance = this.performanceTestingAgent.test({
            ...input,
            qaResults: input.qaResults
        });
        const accessibility = this.accessibilityTestingAgent.test(input);
        const regression = this.regressionTestingAgent.test(input);
        const releaseDecision = this.releaseApprovalAgent.decide({
            functional,
            api,
            security,
            performance,
            accessibility,
            regression
        });
        const report = this.reportGenerator.createReport({
            projectId: input.project?.projectId ?? null,
            functional,
            api,
            security,
            performance,
            accessibility,
            regression,
            releaseDecision
        });
        const persisted = this.reportGenerator.persist(report, input.projectRoot ?? null, {
            functional,
            api,
            security,
            performance,
            accessibility,
            regression,
            releaseDecision
        });

        return {
            functional,
            api,
            security,
            performance,
            accessibility,
            regression,
            releaseDecision,
            report: persisted.report,
            reportPaths: persisted.paths,
            reportPath: persisted.paths?.certification ?? null
        };
    }
}
