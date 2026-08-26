import assert from "assert/strict";
import fs from "fs";
import os from "os";
import path from "path";

import EmailOrchestrator from "./lib/company/departments/email-intelligence/email-orchestrator.js";
import EmailProductionConfig from "./lib/company/departments/email-intelligence/production/email-production-config.js";
import CredentialValidator from "./lib/company/departments/email-intelligence/production/credential-validator.js";
import MailboxHealthService from "./lib/company/departments/email-intelligence/production/mailbox-health-service.js";
import EmailAuditService from "./lib/company/departments/email-intelligence/production/email-audit-service.js";
import EmailRateLimiter from "./lib/company/departments/email-intelligence/production/email-rate-limiter.js";
import ProductionEmailOrchestrator from "./lib/company/departments/email-intelligence/production/production-email-orchestrator.js";
import EmailSecurityPolicy from "./lib/company/departments/email-intelligence/security/email-security-policy.js";
import ProductionEmailHealthReportGenerator from "./lib/company/departments/email-intelligence/reports/production-email-health-report-generator.js";

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "annexe-production-email-"));

const missingConfig = new EmailProductionConfig({
    EMAIL_HOST: "",
    EMAIL_PORT: "",
    EMAIL_USER: "",
    EMAIL_PASSWORD: "",
    EMAIL_TLS: ""
});

const credentialValidator = new CredentialValidator();
const missingCredentials = credentialValidator.validate(missingConfig.load());
assert.equal(missingCredentials.status, "NOT_READY");

const securityPolicy = new EmailSecurityPolicy();
const cleanSecurity = securityPolicy.evaluate({
    email: {
        subject: "Customer onboarding",
        body: "Please process our normal request."
    }
});
assert.equal(cleanSecurity.risk, "LOW");
assert.equal(cleanSecurity.action, "PROCESS");

const suspiciousSecurity = securityPolicy.evaluate({
    email: {
        subject: "Urgent credential verification",
        body: "This could be a phishing attempt."
    }
});
assert.equal(suspiciousSecurity.risk, "MEDIUM");
assert.equal(suspiciousSecurity.action, "REVIEW");

const healthService = new MailboxHealthService();
const healthSnapshot = healthService.check({
    mailbox: "ops@annexe.ai"
});
assert.equal(healthSnapshot.mailbox, "ops@annexe.ai");
assert.equal(healthSnapshot.imap, "READY");
assert.equal(healthSnapshot.smtp, "READY");
assert.ok(healthSnapshot.checkedAt);

const auditService = new EmailAuditService();
const limiter = new EmailRateLimiter({ maxProcessingCount: 5 });
const reportGenerator = new ProductionEmailHealthReportGenerator();

const blockedOrchestrator = new ProductionEmailOrchestrator({
    config: missingConfig,
    credentialValidator,
    mailboxHealthService: healthService,
    securityPolicy,
    rateLimiter: limiter,
    auditService,
    reportGenerator,
    emailOrchestrator: new EmailOrchestrator()
});

const blockedResult = blockedOrchestrator.process({
    projectRoot: tempRoot,
    email: {
        id: "blocked-email",
        from: "blocked@example.com",
        to: "sales@annexe.ai",
        subject: "Blocked credential check",
        body: "No production credentials are configured.",
        receivedAt: new Date().toISOString(),
        attachments: []
    }
});

assert.equal(blockedResult.status, "NOT_READY");
assert.equal(blockedResult.credentials.status, "NOT_READY");
assert.equal(blockedResult.emailResult, null);
assert.ok(fs.existsSync(blockedResult.reportPath));

const validConfig = new EmailProductionConfig({
    EMAIL_HOST: "imap.mock.local",
    EMAIL_PORT: "993",
    EMAIL_USER: "ops@annexe.ai",
    EMAIL_PASSWORD: "mock-password",
    EMAIL_TLS: "true"
});

const validOrchestrator = new ProductionEmailOrchestrator({
    config: validConfig,
    credentialValidator: new CredentialValidator(),
    mailboxHealthService: new MailboxHealthService(),
    securityPolicy: new EmailSecurityPolicy(),
    rateLimiter: new EmailRateLimiter({ maxProcessingCount: 5 }),
    auditService: new EmailAuditService(),
    reportGenerator: new ProductionEmailHealthReportGenerator(),
    emailOrchestrator: new EmailOrchestrator()
});

const validEmail = {
    id: "production-email-001",
    from: "buyer@realestate-example.com",
    to: "sales@annexe.ai",
    subject: "Need an enterprise CRM proposal",
    body: "Please send pricing and implementation details.",
    receivedAt: "2026-08-26T09:30:00.000Z",
    attachments: []
};

const validResult = validOrchestrator.process({
    projectRoot: tempRoot,
    email: validEmail
});

assert.equal(validResult.status, "READY");
assert.equal(validResult.credentials.status, "READY");
assert.ok(validResult.emailResult);
assert.equal(validResult.emailResult.classification.category, "SALES");
assert.equal(validResult.emailResult.reply.status, "DRAFT");

const healthReportPath = path.join(tempRoot, "reports", "company", "email", "production-email-health-report.json");
const auditPath = path.join(tempRoot, "reports", "company", "email", "production-email-audit.json");
assert.ok(fs.existsSync(healthReportPath));
assert.ok(fs.existsSync(auditPath));

const healthReport = JSON.parse(fs.readFileSync(healthReportPath, "utf8"));
const auditReport = JSON.parse(fs.readFileSync(auditPath, "utf8"));
assert.equal(healthReport.status, "READY");
assert.equal(healthReport.mailbox, "ops@annexe.ai");
assert.equal(auditReport.received >= 2, true);
assert.equal(auditReport.processed >= 1, true);
assert.equal(auditReport.draftsCreated >= 1, true);

const directEmailResult = new EmailOrchestrator().processIncomingEmail({
    email: {
        id: "regression-email-001",
        from: "customer@example.com",
        to: "sales@annexe.ai",
        subject: "CRM pricing request",
        body: "We want a CRM proposal.",
        receivedAt: "2026-08-26T09:40:00.000Z",
        attachments: []
    },
    projectRoot: tempRoot,
    project: {
        projectId: "EMAIL-REGRESSION",
        name: "Email Regression Check"
    }
});

assert.equal(directEmailResult.classification.category, "SALES");
assert.equal(directEmailResult.reply.status, "DRAFT");

console.log(JSON.stringify({
    status: "PASS",
    missingCredentials: missingCredentials.status,
    validStatus: validResult.status,
    reportPath: validResult.reportPath,
    healthReportPath,
    auditPath
}, null, 2));
