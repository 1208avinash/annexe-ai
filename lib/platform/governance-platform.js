import fs from "fs";
import path from "path";

import GovernanceOrchestrator from "./governance/governance-orchestrator.js";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function reserveRoot(baseName, workspaceRoot) {
    const candidate = path.resolve(workspaceRoot, baseName);
    ensureDir(candidate);
    return candidate;
}

export async function runGovernancePlatform({
    workspaceRoot = "workspace",
    organization = null,
    users = null,
    user = null,
    role = "Administrator",
    permission = "audit.view",
    resource = "governance-report",
    requestText = "Establish enterprise governance controls."
} = {}) {
    const platformRoot = reserveRoot("enterprise-governance-platform", workspaceRoot);
    const orchestrator = new GovernanceOrchestrator();

    const governance = orchestrator.processRequest({
        organization: organization ?? {
            id: "enterprise-customer",
            name: "Enterprise Customer",
            type: "enterprise"
        },
        users,
        user,
        role,
        permission,
        resource,
        requestText,
        platformRoot
    });

    const report = {
        generatedAt: new Date().toISOString(),
        platformRoot,
        identityReadiness: governance.report.identityReadiness,
        ssoReadiness: governance.report.ssoReadiness,
        mfaReadiness: governance.report.mfaReadiness,
        policyReadiness: governance.report.policyReadiness,
        complianceScores: governance.report.complianceScores,
        complianceScore: governance.report.complianceScore,
        auditReadiness: governance.report.auditReadiness,
        dataGovernanceScore: governance.report.dataGovernanceScore,
        overallGovernanceScore: governance.report.overallGovernanceScore,
        status: governance.report.overallGovernanceScore >= 90 ? "READY" : "NEEDS_IMPROVEMENT"
    };

    const reportPath = path.join(platformRoot, "reports", "platform", "governance", "enterprise-governance-report.json");
    writeJson(reportPath, report);

    return {
        success: true,
        platformRoot,
        governance,
        report,
        reportPath
    };
}
