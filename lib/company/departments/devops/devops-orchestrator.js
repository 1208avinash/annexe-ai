import DeploymentAgent from "./deployment/deployment-agent.js";
import CloudOperationsAgent from "./cloud/cloud-operations-agent.js";
import MonitoringAgent from "./monitoring/monitoring-agent.js";
import IncidentResponseAgent from "./incident/incident-response-agent.js";
import AutoScalingAgent from "./scaling/auto-scaling-agent.js";
import DisasterRecoveryAgent from "./recovery/disaster-recovery-agent.js";
import InfrastructureOptimizationAgent from "./optimization/infrastructure-optimization-agent.js";
import DevOpsReportGenerator from "./reports/devops-report-generator.js";

export default class DevOpsOrchestrator {
    constructor({
        deploymentAgent = new DeploymentAgent(),
        cloudOperationsAgent = new CloudOperationsAgent(),
        monitoringAgent = new MonitoringAgent(),
        incidentResponseAgent = new IncidentResponseAgent(),
        autoScalingAgent = new AutoScalingAgent(),
        disasterRecoveryAgent = new DisasterRecoveryAgent(),
        infrastructureOptimizationAgent = new InfrastructureOptimizationAgent(),
        reportGenerator = new DevOpsReportGenerator()
    } = {}) {
        this.deploymentAgent = deploymentAgent;
        this.cloudOperationsAgent = cloudOperationsAgent;
        this.monitoringAgent = monitoringAgent;
        this.incidentResponseAgent = incidentResponseAgent;
        this.autoScalingAgent = autoScalingAgent;
        this.disasterRecoveryAgent = disasterRecoveryAgent;
        this.infrastructureOptimizationAgent = infrastructureOptimizationAgent;
        this.reportGenerator = reportGenerator;
    }

    processRequest(input = {}) {
        const deployment = this.deploymentAgent.plan(input);
        const cloudOperations = this.cloudOperationsAgent.analyze(input);
        const monitoring = this.monitoringAgent.plan(input);
        const incidentResponse = this.incidentResponseAgent.plan(input);
        const scaling = this.autoScalingAgent.plan(input);
        const recovery = this.disasterRecoveryAgent.plan(input);
        const optimization = this.infrastructureOptimizationAgent.plan(input);
        const report = this.reportGenerator.createReport({
            projectId: input.project?.projectId ?? null,
            projectName: input.project?.name ?? null,
            deployment,
            cloudOperations,
            monitoring,
            incidentResponse,
            scaling,
            recovery,
            optimization
        });
        const persisted = this.reportGenerator.persist(report, input.projectRoot ?? null, {
            deployment,
            cloudOperations,
            monitoring,
            incidentResponse,
            scaling,
            recovery,
            optimization
        });

        return {
            deployment,
            cloudOperations,
            monitoring,
            incidentResponse,
            scaling,
            recovery,
            optimization,
            report: persisted.report,
            reportPaths: persisted.paths,
            reportPath: persisted.paths?.certification ?? null
        };
    }
}
