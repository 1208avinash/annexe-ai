import fs from "fs";
import path from "path";

import ReplyApprovalManager from "../../../email-intelligence/approvals/reply-approval-manager.js";
import SmtpClient from "./smtp-client.js";
import SmtpSecurityWrapper from "./smtp-security-wrapper.js";
import EmailSendAuditReportGenerator from "../../reports/email-send-audit-report-generator.js";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function defaultAudit() {
    return {
        sent: 0,
        failed: 0,
        approvalsUsed: 0,
        lastSend: ""
    };
}

function readJson(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }

    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    catch {
        return null;
    }
}

export default class EmailSendService {
    constructor({
        smtpClient = new SmtpClient(),
        securityWrapper = new SmtpSecurityWrapper(),
        approvalManager = new ReplyApprovalManager(),
        reportGenerator = new EmailSendAuditReportGenerator()
    } = {}) {
        this.smtpClient = smtpClient;
        this.securityWrapper = securityWrapper;
        this.approvalManager = approvalManager;
        this.reportGenerator = reportGenerator;
    }

    loadAudit(projectRoot = null) {
        if (!projectRoot) {
            return defaultAudit();
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "email-send-audit.json");
        return readJson(filePath) ?? defaultAudit();
    }

    persistAudit(audit = defaultAudit(), projectRoot = null) {
        if (!projectRoot) {
            return { audit, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "email-send-audit.json");
        writeJson(filePath, audit);
        return { audit, path: filePath };
    }

    sendApprovedReply(input = {}) {
        const approval = input.approval ?? this.approvalManager.load(input.projectRoot ?? null) ?? null;
        if (!approval || approval.status !== "APPROVED") {
            const audit = this.reportGenerator.createReport({
                projectRoot: input.projectRoot ?? null,
                failed: 1,
                approvalsUsed: 0,
                lastSend: ""
            });
            const auditResult = this.reportGenerator.persist(audit, input.projectRoot ?? null);
            return {
                status: "BLOCKED",
                reason: "APPROVAL_NOT_APPROVED",
                approval,
                audit: auditResult.audit,
                auditPath: auditResult.path
            };
        }

        const approvalState = approval.reply ?? {};
        const recipient = String(input.recipient ?? approval.customer ?? "");
        const sender = String(input.sender ?? this.smtpClient.loadConfig().user ?? "");
        const security = this.securityWrapper.evaluate({
            approval,
            recipient,
            sender,
            draft: approval.reply ?? input.draft ?? null
        });

        if (!security.allowed) {
            const audit = this.reportGenerator.createReport({
                projectRoot: input.projectRoot ?? null,
                failed: 1,
                approvalsUsed: 0,
                lastSend: ""
            });
            const auditResult = this.reportGenerator.persist(audit, input.projectRoot ?? null);
            return {
                status: "BLOCKED",
                reason: security.reason,
                approval,
                audit: auditResult.audit,
                auditPath: auditResult.path
            };
        }

        const connection = this.smtpClient.connect();
        const sendResult = this.smtpClient.sendEmail({
            connection,
            from: sender,
            to: recipient,
            subject: approvalState.subject ?? approval.subject ?? "",
            body: approvalState.body ?? approval.reply?.body ?? input.body ?? "",
            messageId: approval.id ?? input.approvalId ?? undefined
        });
        this.smtpClient.disconnect(connection);

        const audit = this.reportGenerator.createReport({
            projectRoot: input.projectRoot ?? null,
            sent: sendResult.status === "SENT" ? 1 : 0,
            failed: sendResult.status === "SENT" ? 0 : 1,
            approvalsUsed: sendResult.status === "SENT" ? 1 : 0,
            lastSend: sendResult.status === "SENT" ? new Date().toISOString() : ""
        });
        const auditResult = this.reportGenerator.persist(audit, input.projectRoot ?? null);

        return {
            status: sendResult.status,
            approvalId: approval.id ?? input.approvalId ?? "",
            recipient,
            timestamp: sendResult.message?.sentAt ?? new Date().toISOString(),
            sendResult,
            security,
            audit: auditResult.audit,
            auditPath: auditResult.path
        };
    }
}
