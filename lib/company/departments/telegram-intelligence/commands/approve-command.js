export default function approveCommand(input = {}) {
    return {
        command: "/approve",
        approvalId: input.approvalId ?? "",
        message: [
            "✅ APPROVED",
            "",
            `Approval ID:`,
            `${input.approvalId ?? ""}`,
            "",
            `Status:`,
            "READY_FOR_ACTION"
        ].join("\n")
    };
}
