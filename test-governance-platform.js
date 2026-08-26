import assert from "assert/strict";
import fs from "fs";
import path from "path";

import { runGovernancePlatform } from "./lib/platform/governance-platform.js";

const workspaceRoot = path.join(process.cwd(), "workspace", "governance-platform-test");
fs.rmSync(workspaceRoot, { recursive: true, force: true });

const result = await runGovernancePlatform({
    workspaceRoot,
    organization: {
        id: "enterprise-customer",
        name: "Enterprise Customer",
        type: "enterprise"
    },
    user: {
        id: "user-admin",
        email: "admin@annexe.ai",
        name: "Administrator"
    },
    role: "Administrator",
    permission: "audit.view",
    resource: "governance-report"
});

assert.ok(result.success);
assert.ok(fs.existsSync(result.reportPath));
assert.equal(result.report.identityReadiness, 100);
assert.equal(result.report.ssoReadiness, 100);
assert.equal(result.report.mfaReadiness, 100);
assert.equal(result.report.policyReadiness, 100);
assert.ok(result.report.complianceScore >= 90);
assert.equal(result.report.auditReadiness, 100);
assert.ok(result.report.dataGovernanceScore >= 90);
assert.ok(result.report.overallGovernanceScore >= 90);
assert.equal(result.report.status, "READY");

console.log(JSON.stringify({
    status: "PASS",
    reportPath: result.reportPath,
    identityReadiness: result.report.identityReadiness,
    ssoReadiness: result.report.ssoReadiness,
    mfaReadiness: result.report.mfaReadiness,
    policyReadiness: result.report.policyReadiness,
    complianceScore: result.report.complianceScore,
    auditReadiness: result.report.auditReadiness,
    dataGovernanceScore: result.report.dataGovernanceScore,
    overallGovernanceScore: result.report.overallGovernanceScore
}, null, 2));
