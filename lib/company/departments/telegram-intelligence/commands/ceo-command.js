export default function ceoCommand(context = {}) {
    const ceoSummary = context.ceoSummary ?? {};

    return {
        command: "/ceo",
        message: [
            "ANNEXE AI CEO SUMMARY",
            "",
            ceoSummary.summary ?? "AI CEO summary placeholder.",
            "",
            `Market: ${ceoSummary.market ?? "ready"}`,
            `Strategy: ${ceoSummary.strategy ?? "ready"}`
        ].join("\n")
    };
}
