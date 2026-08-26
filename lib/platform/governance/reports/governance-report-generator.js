import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class GovernanceReportGenerator {
    createReport(input = {}) {
        const identityReadiness = input.identity?.ready ? 100 : 0;
        const ssoReadiness = input.sso?.ready ? 100 : 0;
        const mfaReadiness = input.mfa?.ready ? 100 : 0;
        const policyReadiness = input.policy?.ready ? 100 : 0;
        const complianceScores = input.compliance?.scores ?? {};
        const auditReadiness = input.auditTrail?.length ? 100 : 0;
        const dataGovernanceScore = input.dataGovernance?.score ?? 0;
        const complianceScore = input.compliance?.complianceScore ?? 0;

        const overallGovernanceScore = Math.round(
            (
                identityReadiness +
                ssoReadiness +
                mfaReadiness +
                policyReadiness +
                complianceScore +
                auditReadiness +
                dataGovernanceScore
            ) / 7
        );

        return {
            reportId: `GOV-${Date.now()}`,
            projectId: input.projectId ?? null,
            generatedAt: new Date().toISOString(),
            identityReadiness,
            ssoReadiness,
            mfaReadiness,
            policyReadiness,
            complianceScores,
            complianceScore,
            auditReadiness,
            dataGovernanceScore,
            overallGovernanceScore,
            identity: input.identity ?? null,
            sso: input.sso ?? null,
            mfa: input.mfa ?? null,
            policy: input.policy ?? null,
            compliance: input.compliance ?? null,
            auditTrail: input.auditTrail ?? [],
            evidence: input.evidence ?? null,
            dataGovernance: input.dataGovernance ?? null
        };
    }

    persist(report, platformRoot) {
        if (!platformRoot) {
            return { report, path: null };
        }

        const filePath = path.join(platformRoot, "reports", "platform", "governance", "enterprise-governance-report.json");
        writeJson(filePath, report);
        return { report, path: filePath };
    }
}
