export default function editCommand(input = {}) {
    return {
        command: "/edit",
        approvalId: input.approvalId ?? "",
        message: [
            "✏️ UPDATED",
            "",
            `Approval ID:`,
            `${input.approvalId ?? ""}`
        ].join("\n")
    };
}
