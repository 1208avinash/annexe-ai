import SolutionArchitectAgent from "./solution/solution-architect-agent.js";
import CloudArchitectAgent from "./cloud/cloud-architect-agent.js";
import SecurityArchitectAgent from "./security/security-architect-agent.js";
import DatabaseArchitectAgent from "./database/database-architect-agent.js";
import IntegrationArchitectAgent from "./integration/integration-architect-agent.js";
import ScalingArchitectAgent from "./performance/scaling-architect-agent.js";
import ArchitectureReportGenerator from "./reports/architecture-report-generator.js";

export default class ArchitectureOrchestrator {
    constructor({
        solutionAgent = new SolutionArchitectAgent(),
        cloudAgent = new CloudArchitectAgent(),
        securityAgent = new SecurityArchitectAgent(),
        databaseAgent = new DatabaseArchitectAgent(),
        integrationAgent = new IntegrationArchitectAgent(),
        scalingAgent = new ScalingArchitectAgent(),
        reportGenerator = new ArchitectureReportGenerator()
    } = {}) {
        this.solutionAgent = solutionAgent;
        this.cloudAgent = cloudAgent;
        this.securityAgent = securityAgent;
        this.databaseAgent = databaseAgent;
        this.integrationAgent = integrationAgent;
        this.scalingAgent = scalingAgent;
        this.reportGenerator = reportGenerator;
    }

    processRequest(input = {}) {
        const solution = this.solutionAgent.generate(input);
        const cloud = this.cloudAgent.design(input);
        const security = this.securityAgent.design(input);
        const database = this.databaseAgent.design(input);
        const integration = this.integrationAgent.design(input);
        const scaling = this.scalingAgent.design(input);
        const finalRecommendation = {
            frontend: "React",
            backend: "FastAPI",
            database: database.databaseRecommendation,
            cloud: cloud.cloudRecommendation,
            security: security.securityArchitecture.join(" + "),
            scaling: scaling.scalingStrategy,
            confidence: 95
        };
        const report = this.reportGenerator.createReport({
            projectId: input.project?.projectId ?? null,
            solution,
            cloud,
            security,
            database,
            integration,
            scaling,
            finalRecommendation,
            confidence: 95
        });
        const persisted = this.reportGenerator.persist(report, input.projectRoot ?? null);

        return {
            solution,
            cloud,
            security,
            database,
            integration,
            scaling,
            report: persisted.report,
            reportPath: persisted.path
        };
    }
}
