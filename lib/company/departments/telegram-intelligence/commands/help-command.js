export default function helpCommand() {
    return {
        command: "/help",
        message: [
            "ANNEXE AI TELEGRAM COMMANDS",
            "",
            "/help - show available commands",
            "/status - show ANNEXE AI status",
            "/report - show company summary",
            "/ceo - show AI CEO summary"
        ].join("\n")
    };
}
