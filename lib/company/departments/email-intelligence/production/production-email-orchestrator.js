import EmailProductionConfig from "./email-production-config.js";
import CredentialValidator from "./credential-validator.js";
import MailboxHealthService from "./mailbox-health-service.js";
import EmailSecurityPolicy from "../security/email-security-policy.js";
import EmailRateLimiter from "./email-rate-limiter.js";
import EmailAuditService from "./email-audit-service.js";
import ProductionEmailHealthReportGenerator from "../reports/production-email-health-report-generator.js";
import ImapClient from "./imap/imap-client.js";
import MailboxReaderService from "./imap/mailbox-reader-service.js";
import ImapSecurityWrapper from "./imap/imap-security-wrapper.js";
import MailboxSyncService from "./imap/mailbox-sync-service.js";
import MailboxSyncReportGenerator from "../reports/mailbox-sync-report-generator.js";
import EmailOrchestrator from "../email-orchestrator.js";

export default class ProductionEmailOrchestrator {
    constructor({
        config = new EmailProductionConfig(),
        credentialValidator = new CredentialValidator(),
        mailboxHealthService = new MailboxHealthService(),
        securityPolicy = new EmailSecurityPolicy(),
        rateLimiter = new EmailRateLimiter(),
        auditService = new EmailAuditService(),
        reportGenerator = new ProductionEmailHealthReportGenerator(),
        imapClient = new ImapClient(),
        mailboxReaderService = new MailboxReaderService({ client: imapClient }),
        imapSecurityWrapper = new ImapSecurityWrapper(),
        mailboxSyncService = new MailboxSyncService({
            client: imapClient,
            readerService: mailboxReaderService,
            securityWrapper: imapSecurityWrapper,
            emailOrchestrator: new EmailOrchestrator(),
            reportGenerator: new MailboxSyncReportGenerator()
        }),
        emailOrchestrator = null
    } = {}) {
        this.config = config;
        this.credentialValidator = credentialValidator;
        this.mailboxHealthService = mailboxHealthService;
        this.securityPolicy = securityPolicy;
        this.rateLimiter = rateLimiter;
        this.auditService = auditService;
        this.reportGenerator = reportGenerator;
        this.imapClient = imapClient;
        this.mailboxReaderService = mailboxReaderService;
        this.imapSecurityWrapper = imapSecurityWrapper;
        this.mailboxSyncService = mailboxSyncService;
        this.emailOrchestrator = emailOrchestrator;
    }

    process(input = {}) {
        const productionConfig = this.config.load();
        const credentials = this.credentialValidator.validate(productionConfig);
        const mailboxHealth = this.mailboxHealthService.check({
            mailbox: productionConfig.user || productionConfig.host || ""
        });
        const security = this.securityPolicy.evaluate({
            email: input.email ?? {}
        });
        const rate = this.rateLimiter.allow();
        const allowed = credentials.status === "READY" && rate.allowed;
        const audit = this.auditService.track({
            received: 1,
            processed: allowed ? 1 : 0,
            draftsCreated: allowed && input.email ? 1 : 0,
            blocked: allowed ? 0 : 1
        }, input.projectRoot ?? null);

        let emailResult = null;
        if (allowed && this.emailOrchestrator && input.email) {
            emailResult = this.emailOrchestrator.processIncomingEmail({
                email: input.email,
                projectRoot: input.projectRoot ?? null,
                project: input.project ?? null
            });
        }

        const healthReport = this.reportGenerator.createReport({
            status: credentials.status,
            mailbox: mailboxHealth.mailbox,
            security,
            audit: audit.audit
        });
        const persisted = this.reportGenerator.persist(healthReport, input.projectRoot ?? null);

        return {
            status: credentials.status,
            credentials,
            mailboxHealth,
            security,
            rate,
            audit: audit.audit,
            emailResult,
            report: persisted.report,
            reportPath: persisted.path
        };
    }

    syncMailbox(input = {}) {
        const productionConfig = this.config.load();
        const credentials = this.credentialValidator.validate(productionConfig);
        if (credentials.status !== "READY") {
            const healthReport = this.reportGenerator.createReport({
                status: credentials.status,
                mailbox: productionConfig.user || productionConfig.host || "",
                security: {
                    risk: "LOW",
                    action: "PROCESS",
                    senderValidation: "PLACEHOLDER",
                    phishingScore: 0,
                    attachmentScan: "PLACEHOLDER"
                },
                audit: this.auditService.load(input.projectRoot ?? null)
            });
            const persisted = this.reportGenerator.persist(healthReport, input.projectRoot ?? null);
            return {
                status: "NOT_READY",
                credentials,
                sync: null,
                report: persisted.report,
                reportPath: persisted.path
            };
        }

        const sync = this.mailboxSyncService.sync({
            config: productionConfig,
            projectRoot: input.projectRoot ?? null,
            project: input.project ?? null,
            messages: input.messages ?? input.mockMessages ?? [],
            connection: {
                ...this.imapClient.connect(productionConfig),
                mailbox: productionConfig.user || productionConfig.host || "hello@annexai.co.uk"
            },
            telegramNotificationService: input.telegramNotificationService ?? null
        });

        return {
            status: sync.status,
            credentials,
            sync,
            report: sync.report,
            reportPath: sync.reportPath
        };
    }
}
