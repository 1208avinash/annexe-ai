export default function startCommand() {
    return {
        command: "/start",
        message: [
            "ANNEXE AI TELEGRAM",
            "",
            "Welcome to ANNEXE AI.",
            "",
            "Available commands:",
            "/help",
            "/status",
            "/report",
            "/ceo"
        ].join("\n")
    };
}
