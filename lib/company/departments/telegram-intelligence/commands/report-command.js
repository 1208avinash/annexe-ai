export default function reportCommand(context = {}) {
    const companyReport = context.companyReport ?? {};
    const telegramReport = context.telegramReport ?? {};
    const email = companyReport.emailDepartment ?? {};

    return {
        command: "/report",
        report: {
            projectId: companyReport.projectId ?? null,
            projectName: companyReport.projectName ?? null,
            telegram: telegramReport,
            email: {
                emailsProcessed: email.emailsProcessed ?? 0,
                approvalsPending: email.approvalsPending ?? 0,
                employeeRouting: email.employeeRouting ?? {}
            }
        },
        message: [
            "ANNEXE AI COMPANY REPORT",
            "",
            `Project: ${companyReport.projectName ?? "Unknown"}`,
            `Telegram Commands: ${telegramReport.commandsProcessed ?? 0}`,
            `Email Processed: ${email.emailsProcessed ?? 0}`
        ].join("\n")
    };
}
