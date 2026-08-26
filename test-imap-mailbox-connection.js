import assert from "assert/strict";
import fs from "fs";
import os from "os";
import path from "path";

import EmailProductionConfig from "./lib/company/departments/email-intelligence/production/email-production-config.js";
import CredentialValidator from "./lib/company/departments/email-intelligence/production/credential-validator.js";
import ImapClient from "./lib/company/departments/email-intelligence/production/imap/imap-client.js";
import MailboxReaderService from "./lib/company/departments/email-intelligence/production/imap/mailbox-reader-service.js";
import ImapSecurityWrapper from "./lib/company/departments/email-intelligence/production/imap/imap-security-wrapper.js";
import MailboxSyncService from "./lib/company/departments/email-intelligence/production/imap/mailbox-sync-service.js";
import MailboxSyncReportGenerator from "./lib/company/departments/email-intelligence/reports/mailbox-sync-report-generator.js";
import ProductionEmailOrchestrator from "./lib/company/departments/email-intelligence/production/production-email-orchestrator.js";
import EmailOrchestrator from "./lib/company/departments/email-intelligence/email-orchestrator.js";
import NotificationService from "./lib/company/departments/telegram-intelligence/bot/notification-service.js";

const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), "annexe-imap-mailbox-"));

const missingConfig = new EmailProductionConfig({
    EMAIL_HOST: "",
    EMAIL_IMAP_PORT: "",
    EMAIL_USER: "",
    EMAIL_PASSWORD: "",
    EMAIL_TLS: ""
});

const validator = new CredentialValidator();
const missingCredentials = validator.validate(missingConfig.load());
assert.equal(missingCredentials.status, "NOT_READY");

const mockMessages = [
    {
        id: "imap-001",
        from: "hello@customer.com",
        to: "hello@annexai.co.uk",
        subject: "Need CRM pricing",
        body: "Please send a proposal for our sales team.",
        receivedAt: "2026-08-26T10:00:00.000Z",
        attachments: []
    },
    {
        id: "imap-002",
        from: "support@customer.com",
        to: "hello@annexai.co.uk",
        subject: "Support request",
        body: "We need help with login access.",
        receivedAt: "2026-08-26T10:05:00.000Z",
        attachments: []
    }
];

const validConfig = new EmailProductionConfig({
    EMAIL_HOST: "imap.namecheap.com",
    EMAIL_IMAP_PORT: "993",
    EMAIL_USER: "hello@annexai.co.uk",
    EMAIL_PASSWORD: "mock-password",
    EMAIL_TLS: "true"
});

const imapClient = new ImapClient({
    env: {
        EMAIL_HOST: "imap.namecheap.com",
        EMAIL_IMAP_PORT: "993",
        EMAIL_USER: "hello@annexai.co.uk",
        EMAIL_PASSWORD: "mock-password",
        EMAIL_TLS: "true"
    },
    mockMessages
});

const connection = imapClient.connect(validConfig.load());
assert.equal(connection.status, "CONNECTED");
assert.equal(connection.readOnly, true);

const readerService = new MailboxReaderService({ client: imapClient });
const securityWrapper = new ImapSecurityWrapper();
const reportGenerator = new MailboxSyncReportGenerator();
const notificationService = new NotificationService();
const emailOrchestrator = new EmailOrchestrator();
const syncService = new MailboxSyncService({
    client: imapClient,
    readerService,
    securityWrapper,
    emailOrchestrator,
    telegramNotificationService: notificationService,
    reportGenerator
});

const firstSync = syncService.sync({
    projectRoot,
    config: validConfig.load(),
    project: {
        projectId: "IMAP-TEST",
        name: "IMAP Mailbox Connection Test"
    }
});

assert.equal(firstSync.status, "SYNCED");
assert.equal(firstSync.processed.length, 2);
assert.ok(firstSync.notifications.length >= 1);

const secondSync = syncService.sync({
    projectRoot,
    config: validConfig.load(),
    project: {
        projectId: "IMAP-TEST",
        name: "IMAP Mailbox Connection Test"
    }
});

assert.equal(secondSync.processed.length, 0);
assert.ok(fs.existsSync(path.join(projectRoot, "memory", "mailbox-sync-state.json")));
assert.ok(fs.existsSync(path.join(projectRoot, "reports", "company", "email", "mailbox-sync-report.json")));

const blockedProduction = new ProductionEmailOrchestrator({
    config: missingConfig,
    emailOrchestrator: new EmailOrchestrator()
});

const blockedResult = blockedProduction.syncMailbox({
    projectRoot
});

assert.equal(blockedResult.status, "NOT_READY");
assert.ok(fs.existsSync(blockedResult.reportPath));

const report = JSON.parse(fs.readFileSync(path.join(projectRoot, "reports", "company", "email", "mailbox-sync-report.json"), "utf8"));
assert.equal(report.mailbox, "hello@annexai.co.uk");
assert.equal(report.emailsRead, 2);

console.log(JSON.stringify({
    status: "PASS",
    firstSync: {
        status: firstSync.status,
        processed: firstSync.processed.length,
        notifications: firstSync.notifications.length
    },
    secondSync: {
        processed: secondSync.processed.length
    },
    blockedStatus: blockedResult.status,
    reportPath: path.join(projectRoot, "reports", "company", "email", "mailbox-sync-report.json")
}, null, 2));
