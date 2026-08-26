export default class MailboxPollingService {
    constructor({ intervalMs = Number(process.env.EMAIL_POLL_INTERVAL ?? 300), orchestrator = null } = {}) {
        this.intervalMs = Number.isFinite(intervalMs) && intervalMs > 0 ? intervalMs : 300;
        this.orchestrator = orchestrator;
        this.timer = null;
        this.processedMessageIds = new Set();
        this.status = "inactive";
    }

    startPolling(input = {}) {
        if (this.timer) {
            return { interval: this.intervalMs, status: "active" };
        }

        this.status = "active";
        const intervalMs = Number.isFinite(Number(input.interval ?? this.intervalMs)) && Number(input.interval ?? this.intervalMs) > 0
            ? Number(input.interval ?? this.intervalMs)
            : this.intervalMs;

        this.timer = setInterval(() => {
            void this.pollOnce(input);
        }, intervalMs);

        return { interval: intervalMs, status: this.status };
    }

    stopPolling() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        this.status = "inactive";
        return { status: this.status };
    }

    async pollOnce(input = {}) {
        const messages = Array.isArray(input.messages) ? input.messages : [];
        const newMessages = messages.filter(message => {
            const messageId = message?.id ?? message?.messageId ?? message?.uid ?? null;
            if (!messageId || this.processedMessageIds.has(messageId)) {
                return false;
            }
            this.processedMessageIds.add(messageId);
            return true;
        });

        const processed = [];
        for (const message of newMessages) {
            if (this.orchestrator?.processIncomingEmail) {
                processed.push(await this.orchestrator.processIncomingEmail({ ...input, email: message }));
            }
            else {
                processed.push(message);
            }
        }

        return {
            interval: this.intervalMs,
            status: this.status,
            processedCount: processed.length,
            messages: processed
        };
    }
}
