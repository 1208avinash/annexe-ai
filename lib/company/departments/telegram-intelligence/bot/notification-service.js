export default class NotificationService {
    sendNotification(input = {}) {
        const type = String(input.type ?? "General");
        const customer = input.customer ?? "";
        const action = input.action ?? "Review";

        return {
            status: "NOTIFICATION_CREATED",
            message: [
                "🤖 ANNEXE AI ALERT",
                "",
                `Type:`,
                `${type}`,
                "",
                `Customer:`,
                `${customer}`,
                "",
                `Action:`,
                `${action}`
            ].join("\n"),
            sentAt: new Date().toISOString()
        };
    }
}
