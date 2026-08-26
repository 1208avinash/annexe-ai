import assert from "assert/strict";
import path from "path";
import fs from "fs";

import SecurityOrchestrator from "./lib/company/departments/security/security-orchestrator.js";

const orchestrator = new SecurityOrchestrator();
const projectRoot = path.join(process.cwd(), "workspace", "security-department-test");
const result = orchestrator.processRequest({
    requestText: "Create an AI CRM platform for real estate companies",
    analysis: {
        industry: "Real Estate",
        users: ["Sales teams", "Managers"]
    },
    project: {
        projectId: "TEST-SEC-001",
        name: "Security Department Test"
    },
    projectRoot,
    architectureDepartment: {
        security: { architectureSecurity: ["JWT", "RBAC"] }
    },
    engineeringDepartment: {
        backendPlan: { status: "READY" }
    },
    composition: {
        dependencies: [
            { name: "fastapi", status: "current", risk: "low" },
            { name: "react", status: "current", risk: "low" }
        ]
    },
    qaResults: {
        api: { passed: true },
        security: { passed: true }
    }
});

assert.ok(result.audit);
assert.ok(result.application);
assert.ok(result.dependency);
assert.ok(result.compliance);
assert.ok(result.privacy);
assert.ok(result.penetration);
assert.ok(result.report);
assert.ok(result.reportPaths);
assert.equal(result.report.status, "APPROVED");
assert.ok(String(result.reportPaths.certification).includes(path.join("reports", "company", "security", "security-certification-report.json")));
assert.ok(fs.existsSync(result.reportPaths.certification));

console.log(JSON.stringify({
    status: "PASS",
    securityAuditGenerated: true,
    applicationSecurityGenerated: true,
    dependencySecurityGenerated: true,
    complianceReportGenerated: true,
    privacyReportGenerated: true,
    penetrationTestGenerated: true,
    securityCertificationGenerated: true,
    reportPath: result.reportPaths.certification,
    securityScore: result.report.securityScore
}, null, 2));
