import SecurityAuditAgent from "./audit/security-audit-agent.js";
import ApplicationSecurityAgent from "./application/application-security-agent.js";
import DependencySecurityAgent from "./dependency/dependency-security-agent.js";
import ComplianceAgent from "./compliance/compliance-agent.js";
import PrivacyAgent from "./privacy/privacy-agent.js";
import PenetrationTestingAgent from "./penetration/penetration-testing-agent.js";
import SecurityReportGenerator from "./reports/security-report-generator.js";

export default class SecurityOrchestrator {
    constructor({
        securityAuditAgent = new SecurityAuditAgent(),
        applicationSecurityAgent = new ApplicationSecurityAgent(),
        dependencySecurityAgent = new DependencySecurityAgent(),
        complianceAgent = new ComplianceAgent(),
        privacyAgent = new PrivacyAgent(),
        penetrationTestingAgent = new PenetrationTestingAgent(),
        reportGenerator = new SecurityReportGenerator()
    } = {}) {
        this.securityAuditAgent = securityAuditAgent;
        this.applicationSecurityAgent = applicationSecurityAgent;
        this.dependencySecurityAgent = dependencySecurityAgent;
        this.complianceAgent = complianceAgent;
        this.privacyAgent = privacyAgent;
        this.penetrationTestingAgent = penetrationTestingAgent;
        this.reportGenerator = reportGenerator;
    }

    processRequest(input = {}) {
        const audit = this.securityAuditAgent.analyze(input);
        const application = this.applicationSecurityAgent.review(input);
        const dependency = this.dependencySecurityAgent.review(input);
        const compliance = this.complianceAgent.review(input);
        const privacy = this.privacyAgent.review(input);
        const penetration = this.penetrationTestingAgent.test(input);
        const report = this.reportGenerator.createReport({
            projectId: input.project?.projectId ?? null,
            projectName: input.project?.name ?? null,
            audit,
            application,
            dependency,
            compliance,
            privacy,
            penetration
        });
        const persisted = this.reportGenerator.persist(report, input.projectRoot ?? null, {
            audit,
            application,
            dependency,
            compliance,
            privacy,
            penetration
        });

        return {
            audit,
            application,
            dependency,
            compliance,
            privacy,
            penetration,
            report: persisted.report,
            reportPaths: persisted.paths,
            reportPath: persisted.paths?.certification ?? null
        };
    }
}
