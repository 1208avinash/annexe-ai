import helpCommand from "../commands/help-command.js";
import statusCommand from "../commands/status-command.js";
import reportCommand from "../commands/report-command.js";
import ceoCommand from "../commands/ceo-command.js";
import approveCommand from "../commands/approve-command.js";
import rejectCommand from "../commands/reject-command.js";
import editCommand from "../commands/edit-command.js";

export default class CommandHandler {
    handle(input = {}) {
        const command = String(input.command ?? "").trim().toLowerCase();
        const context = input.context ?? {};
        const args = String(input.args ?? "").trim();
        const [approvalId, ...messageParts] = args.split(/\s+/);
        const message = messageParts.join(" ").trim();

        switch (command) {
            case "/help":
                return helpCommand(context);
            case "/status":
                return statusCommand(context);
            case "/report":
                return reportCommand(context);
            case "/ceo":
                return ceoCommand(context);
            case "/approve":
                return approveCommand({ approvalId });
            case "/reject":
                return rejectCommand({ approvalId });
            case "/edit":
                return editCommand({ approvalId, message });
            default:
                return {
                    command,
                    message: "Unknown command. Use /help to see available commands."
                };
        }
    }
}
