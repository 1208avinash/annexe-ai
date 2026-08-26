import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class EmailIntelligenceReportGenerator {
    createReport(input = {}) {
        const memory = input.memory ?? {};
        const classification = input.classification ?? {};
        const languageContext = input.languageContext ?? {};
        const email = input.email ?? {};
        const security = input.security ?? {};
        const route = input.route ?? {};
        const customerContext = input.customerContext ?? null;
        const conversationSummary = input.conversationSummary ?? null;
        const intent = input.intent ?? null;
        const relationship = input.relationship ?? null;
        const employeeRouting = input.employeeRouting ?? null;
        const employeeConnector = input.employeeConnector ?? null;
        const employeeRoutingReport = input.employeeRoutingReport ?? null;
        const dashboard = input.dashboard ?? null;
        const approvals = input.approvals ?? null;
        const customers = input.customers ?? null;
        const employees = input.employees ?? null;
        const commandCenterReport = input.commandCenterReport ?? null;
        const approval = input.approval ?? {};
        const analytics = input.analytics ?? {};

        return {
            reportId: `EMAIL-${Date.now()}`,
            projectId: input.projectId ?? null,
            emailsProcessed: memory.conversationCount ?? 0,
            categories: memory.categories ?? {},
            languages: memory.languages ?? {},
            draftsCreated: input.reply?.status === "DRAFT" ? 1 : 0,
            approvalsPending: approval.status === "PENDING_APPROVAL" ? 1 : 0,
            securityFlags: (security.spamIndicators ?? []).length + (security.suspiciousLinks ?? []).length,
            latestEmail: {
                id: email.id ?? null,
                from: email.from ?? null,
                subject: email.subject ?? null
            },
            classification,
            route,
            customerContext,
            conversationSummary,
            intent,
            relationship,
            employeeRouting,
            employeeConnector,
            employeeRoutingReport,
            dashboard,
            approvals,
            customers,
            employees,
            commandCenterReport,
            languageContext,
            security,
            reply: input.reply ?? null,
            approval,
            analytics,
            memorySummary: {
                senderCount: Object.keys(memory.senderHistory ?? {}).length,
                conversationCount: memory.conversationCount ?? 0
            },
            generatedAt: new Date().toISOString()
        };
    }

    persist(report, projectRoot) {
        if (!projectRoot) {
            return { report, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "email-intelligence-report.json");
        writeJson(filePath, report);
        return { report, path: filePath };
    }
}
