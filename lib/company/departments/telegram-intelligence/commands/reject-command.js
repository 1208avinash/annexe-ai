export default function rejectCommand(input = {}) {
    return {
        command: "/reject",
        approvalId: input.approvalId ?? "",
        message: [
            "❌ REJECTED",
            "",
            `Approval ID:`,
            `${input.approvalId ?? ""}`
        ].join("\n")
    };
}
