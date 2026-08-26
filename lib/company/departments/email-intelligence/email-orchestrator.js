import EmailConnectionAgent from "./agents/email-connection-agent.js";
import ImapAdapter from "./adapters/imap-adapter.js";
import SmtpAdapter from "./adapters/smtp-adapter.js";
import EmailReaderAgent from "./agents/email-reader-agent.js";
import EmailClassifierAgent from "./agents/email-classifier-agent.js";
import EmailReplyAgent from "./agents/email-reply-agent.js";
import EmailMemoryAgent from "./agents/email-memory-agent.js";
import EmailSecurityAgent from "./agents/email-security-agent.js";
import EmailIntelligenceReportGenerator from "./reports/email-intelligence-report-generator.js";
import EmailRouter from "./routing/email-router.js";
import ReplyApprovalManager from "./approvals/reply-approval-manager.js";
import EmailAnalyticsService from "./analytics/email-analytics-service.js";
import EmailDashboardService from "./dashboard/email-dashboard-service.js";
import ApprovalDashboardService from "./dashboard/approval-dashboard-service.js";
import CustomerInsightService from "./dashboard/customer-insight-service.js";
import EmployeeActivityService from "./dashboard/employee-activity-service.js";
import CustomerContextAgent from "./context/customer-context-agent.js";
import ConversationSummaryAgent from "./context/conversation-summary-agent.js";
import IntentPredictionAgent from "./context/intent-prediction-agent.js";
import RelationshipIntelligenceAgent from "./context/relationship-intelligence-agent.js";
import CustomerContextReportGenerator from "./reports/customer-context-report-generator.js";
import AiEmployeeRouter from "./employee-routing/ai-employee-router.js";
import SalesEmployeeConnector from "./employee-routing/sales-employee-connector.js";
import SupportEmployeeConnector from "./employee-routing/support-employee-connector.js";
import SecurityEmployeeConnector from "./employee-routing/security-employee-connector.js";
import BillingEmployeeConnector from "./employee-routing/billing-employee-connector.js";
import CeoInsightConnector from "./employee-routing/ceo-insight-connector.js";
import EmployeeRoutingReportGenerator from "./reports/employee-routing-report-generator.js";
import CommandCenterEmailReportGenerator from "./reports/command-center-email-report-generator.js";
import LanguageOrchestrator from "../language-intelligence/language-orchestrator.js";

export default class EmailOrchestrator {
    constructor({
        connectionAgent = new EmailConnectionAgent(),
        imapAdapter = new ImapAdapter(),
        smtpAdapter = new SmtpAdapter(),
        readerAgent = new EmailReaderAgent(),
        classifierAgent = new EmailClassifierAgent(),
        replyAgent = new EmailReplyAgent(),
        memoryAgent = new EmailMemoryAgent(),
        securityAgent = new EmailSecurityAgent(),
        emailRouter = new EmailRouter(),
        approvalManager = new ReplyApprovalManager(),
        analyticsService = new EmailAnalyticsService(),
        emailDashboardService = new EmailDashboardService(),
        approvalDashboardService = new ApprovalDashboardService(),
        customerInsightService = new CustomerInsightService(),
        employeeActivityService = new EmployeeActivityService(),
        customerContextAgent = new CustomerContextAgent(),
        conversationSummaryAgent = new ConversationSummaryAgent(),
        intentPredictionAgent = new IntentPredictionAgent(),
        relationshipIntelligenceAgent = new RelationshipIntelligenceAgent(),
        customerContextReportGenerator = new CustomerContextReportGenerator(),
        aiEmployeeRouter = new AiEmployeeRouter(),
        salesEmployeeConnector = new SalesEmployeeConnector(),
        supportEmployeeConnector = new SupportEmployeeConnector(),
        securityEmployeeConnector = new SecurityEmployeeConnector(),
        billingEmployeeConnector = new BillingEmployeeConnector(),
        ceoInsightConnector = new CeoInsightConnector(),
        employeeRoutingReportGenerator = new EmployeeRoutingReportGenerator(),
        commandCenterReportGenerator = new CommandCenterEmailReportGenerator(),
        languageOrchestrator = new LanguageOrchestrator(),
        reportGenerator = new EmailIntelligenceReportGenerator()
    } = {}) {
        this.connectionAgent = connectionAgent;
        this.imapAdapter = imapAdapter;
        this.smtpAdapter = smtpAdapter;
        this.readerAgent = readerAgent;
        this.classifierAgent = classifierAgent;
        this.replyAgent = replyAgent;
        this.memoryAgent = memoryAgent;
        this.securityAgent = securityAgent;
        this.emailRouter = emailRouter;
        this.approvalManager = approvalManager;
        this.analyticsService = analyticsService;
        this.emailDashboardService = emailDashboardService;
        this.approvalDashboardService = approvalDashboardService;
        this.customerInsightService = customerInsightService;
        this.employeeActivityService = employeeActivityService;
        this.customerContextAgent = customerContextAgent;
        this.conversationSummaryAgent = conversationSummaryAgent;
        this.intentPredictionAgent = intentPredictionAgent;
        this.relationshipIntelligenceAgent = relationshipIntelligenceAgent;
        this.customerContextReportGenerator = customerContextReportGenerator;
        this.aiEmployeeRouter = aiEmployeeRouter;
        this.salesEmployeeConnector = salesEmployeeConnector;
        this.supportEmployeeConnector = supportEmployeeConnector;
        this.securityEmployeeConnector = securityEmployeeConnector;
        this.billingEmployeeConnector = billingEmployeeConnector;
        this.ceoInsightConnector = ceoInsightConnector;
        this.employeeRoutingReportGenerator = employeeRoutingReportGenerator;
        this.commandCenterReportGenerator = commandCenterReportGenerator;
        this.languageOrchestrator = languageOrchestrator;
        this.reportGenerator = reportGenerator;
    }

    processIncomingEmail(input = {}) {
        const connection = this.connectionAgent.createConnection(input.connection ?? {});
        const imapSession = this.imapAdapter.connect(connection);
        const sourceEmail = Array.isArray(input.messages) && input.messages.length
            ? input.messages[0]
            : input.email ?? input.message ?? input.rawEmail ?? {};
        const normalizedEmail = this.readerAgent.read({ email: sourceEmail });
        const mailboxMessages = this.imapAdapter.fetchMessages({ messages: input.messages ?? [normalizedEmail] });
        const email = this.readerAgent.read({ email: mailboxMessages[0] ?? normalizedEmail });
        const security = this.securityAgent.inspect(email);
        const classification = this.classifierAgent.classify({
            email,
            security,
            connection,
            project: input.project ?? null
        });
        const route = this.emailRouter.route(classification);
        const conversationMessages = mailboxMessages.length ? mailboxMessages : [email];
        const customerContextResult = this.customerContextAgent.analyze({
            email,
            messages: conversationMessages,
            name: input.customer?.name ?? input.name ?? email.from ?? "",
            company: input.customer?.company ?? input.company ?? input.analysis?.companyName ?? "",
            department: route.department,
            priority: route.priority,
            relationshipStage: input.customer?.relationshipStage ?? null
        }, input.projectRoot ?? null);
        const conversationSummaryResult = this.conversationSummaryAgent.summarize({
            threadId: email.id ?? email.from ?? null,
            messages: conversationMessages,
            summary: input.summary ?? null
        }, input.projectRoot ?? null);
        const intentPrediction = this.intentPredictionAgent.predict({
            email,
            customer: customerContextResult.customer,
            summary: conversationSummaryResult.summary
        });
        const employeeRouting = this.aiEmployeeRouter.route({
            category: classification.category,
            intent: intentPrediction.intent,
            priority: classification.priority,
            customerContext: {
                ...customerContextResult.customer,
                securityRisk: security.riskLevel
            }
        });
        const departmentContext = input.departmentContext ?? {};
        let employeeConnector = null;
        if (employeeRouting.employee === "AI Sales Employee") {
            employeeConnector = this.salesEmployeeConnector.connect({
                customer: customerContextResult.customer,
                history: customerContextResult.customer.history ?? {},
                intent: intentPrediction.intent,
                emailContext: email,
                salesDepartment: departmentContext.salesDepartment ?? null
            });
        }
        else if (employeeRouting.employee === "AI Support Employee") {
            employeeConnector = this.supportEmployeeConnector.connect({
                customer: customerContextResult.customer,
                issue: email.subject ?? email.body ?? "",
                severity: security.riskLevel ?? classification.priority ?? "medium",
                recommendedAction: "investigate support case",
                repairIntelligence: departmentContext.repairIntelligence ?? null
            });
        }
        else if (employeeRouting.employee === "AI Security Employee") {
            employeeConnector = this.securityEmployeeConnector.connect({
                customer: customerContextResult.customer,
                riskLevel: security.riskLevel ?? "medium",
                indicators: security.spamIndicators ?? [],
                securityDepartment: departmentContext.securityDepartment ?? null
            });
        }
        else if (employeeRouting.employee === "AI Billing Employee") {
            employeeConnector = this.billingEmployeeConnector.connect({
                customer: customerContextResult.customer,
                invoiceContext: {
                    subject: email.subject ?? "",
                    summary: conversationSummaryResult.summary?.summary ?? conversationSummaryResult.summary ?? ""
                },
                commercialPlatformReady: Boolean(departmentContext.commercialPlatform)
            });
        }
        else {
            employeeConnector = this.ceoInsightConnector.connect({
                emails: [email],
                securityFlags: (security.spamIndicators ?? []).length + (security.suspiciousLinks ?? []).length,
                salesSignals: intentPrediction.intent === "SALES_INQUIRY" ? 1 : 0,
                customerContext: customerContextResult.customer
            });
        }
        const employeeRoutingReport = this.employeeRoutingReportGenerator.createReport({
            routedEmails: 1,
            route: employeeRouting,
            connector: employeeConnector,
            classification,
            intent: intentPrediction,
            customerContext: customerContextResult.customer
        });
        const employeeRoutingReportResult = this.employeeRoutingReportGenerator.persist(
            employeeRoutingReport,
            input.projectRoot ?? null
        );
        const relationshipResult = this.relationshipIntelligenceAgent.track({
            previousStage: customerContextResult.customer.relationshipStage,
            intent: intentPrediction.intent,
            customer: customerContextResult.customer
        });
        customerContextResult.customer.relationshipStage = relationshipResult.currentStage;
        if (customerContextResult.memory?.profiles?.[customerContextResult.customer.customerId]) {
            customerContextResult.memory.profiles[customerContextResult.customer.customerId].relationshipStage = relationshipResult.currentStage;
        }
        const persistedCustomerContext = this.customerContextAgent.persist(customerContextResult.memory, input.projectRoot ?? null);
        const customerContextReport = this.customerContextReportGenerator.createReport({
            customer: customerContextResult.customer,
            summary: conversationSummaryResult.summary,
            intent: intentPrediction,
            relationship: relationshipResult,
            memory: {
                customer: customerContextResult.memory,
                conversation: conversationSummaryResult.memory
            },
            customersTracked: customerContextResult.memory.customersTracked ?? 0,
            conversationsAnalyzed: conversationSummaryResult.memory.conversationsAnalyzed ?? 0
        });
        const customerContextReportResult = this.customerContextReportGenerator.persist(
            customerContextReport,
            input.projectRoot ?? null
        );
        const languageResult = this.languageOrchestrator.processRequest({
            requestText: `${email.subject ?? ""}\n${email.body ?? ""}`.trim(),
            analysis: input.analysis ?? null,
            project: input.project ?? null,
            projectRoot: input.projectRoot ?? null
        });
        const reply = this.replyAgent.generateDraft({
            email,
            classification,
            route,
            intent: intentPrediction,
            relationship: relationshipResult,
            employeeRouting,
            employeeConnector,
            languageContext: languageResult.languageContext ?? null,
            security
        });
        const approvalResult = this.approvalManager.createApprovalState({
            email,
            classification,
            route,
            intent: intentPrediction,
            relationship: relationshipResult,
            employeeRouting,
            employeeConnector,
            reply
        }, input.projectRoot ?? null);
        const memoryResult = this.memoryAgent.remember({
            email,
            classification,
            route,
            customerContext: customerContextResult.customer,
            conversationSummary: conversationSummaryResult.summary,
            intent: intentPrediction,
            relationship: relationshipResult,
            employeeRouting,
            employeeConnector,
            reply,
            approval: approvalResult.state,
            languageContext: languageResult.languageContext ?? null,
            security
        }, input.projectRoot ?? null);
        const analyticsResult = this.analyticsService.update({
            email,
            classification,
            route,
            intent: intentPrediction,
            relationship: relationshipResult,
            employeeRouting,
            employeeConnector,
            reply,
            approval: approvalResult.state,
            languageContext: languageResult.languageContext ?? null
        }, input.projectRoot ?? null);
        const dashboardResult = this.emailDashboardService.summarize({
            email,
            classification,
            route,
            security,
            analytics: analyticsResult.analytics,
            approval: approvalResult.state
        }, input.projectRoot ?? null);
        const approvalsResult = this.approvalDashboardService.summarize({
            email,
            classification,
            route,
            employeeRouting,
            reply,
            approval: approvalResult.state,
            customerContext: customerContextResult.customer
        }, input.projectRoot ?? null);
        const customersResult = this.customerInsightService.summarize(input.projectRoot ?? null);
        const employeesResult = this.employeeActivityService.summarize(input.projectRoot ?? null);
        const commandCenterReport = this.commandCenterReportGenerator.createReport({
            dashboard: dashboardResult.dashboard,
            approvals: approvalsResult,
            customers: customersResult,
            employees: employeesResult,
            latestEmail: email,
            employeeRouting,
            intent: intentPrediction
        });
        const commandCenterReportResult = this.commandCenterReportGenerator.persist(commandCenterReport, input.projectRoot ?? null);
        const draft = this.smtpAdapter.prepareMessage({
            from: connection.user ?? email.to ?? null,
            to: email.from ?? null,
            subject: reply.subject,
            body: reply.body,
            requiresApproval: true
        });
        const report = this.reportGenerator.createReport({
            projectId: input.project?.projectId ?? null,
            email,
            classification,
            route,
            customerContext: customerContextResult.customer,
            conversationSummary: conversationSummaryResult.summary,
            intent: intentPrediction,
            relationship: relationshipResult,
            employeeRouting,
            employeeConnector,
            reply,
            approval: approvalResult.state,
            security,
            languageContext: languageResult.languageContext ?? null,
            memory: memoryResult.memory,
            customerContextReport: customerContextReportResult.report,
            employeeRoutingReport: employeeRoutingReportResult.report,
            dashboard: dashboardResult.dashboard,
            approvals: approvalsResult,
            customers: customersResult,
            employees: employeesResult,
            commandCenterReport,
            commandCenterReportPath: commandCenterReportResult.path,
            analytics: analyticsResult.analytics,
            connection,
            imapSession,
            draft
        });
        const persisted = this.reportGenerator.persist(report, input.projectRoot ?? null);

        return {
            connection,
            imapSession,
            email,
            security,
            classification,
            route,
            customerContext: customerContextResult.customer,
            conversationSummary: conversationSummaryResult.summary,
            intent: intentPrediction,
            relationship: relationshipResult,
            language: languageResult,
            reply,
            approval: approvalResult.state,
            draft,
            memory: memoryResult.memory,
            memoryPath: memoryResult.path,
            customerContextMemoryPath: persistedCustomerContext.path,
            customerContextReport: customerContextReportResult.report,
            customerContextReportPath: customerContextReportResult.path,
            employeeRouting,
            employeeConnector,
            employeeRoutingReport: employeeRoutingReportResult.report,
            employeeRoutingReportPath: employeeRoutingReportResult.path,
            dashboard: dashboardResult.dashboard,
            approvals: approvalsResult,
            customers: customersResult,
            employees: employeesResult,
            commandCenterReport,
            commandCenterReportPath: commandCenterReportResult.path,
            analytics: analyticsResult.analytics,
            analyticsPath: analyticsResult.path,
            approvalPath: approvalResult.path,
            report: persisted.report,
            reportPath: persisted.path
        };
    }
}
