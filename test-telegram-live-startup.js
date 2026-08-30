import assert from "assert/strict";

import { startProductionTelegramRuntime } from "./lib/platform/production-telegram-runtime.js";

const sentMessages = [];
const mockTransport = {
    async getUpdates({ offset = 0 } = {}) {
        return {
            ok: true,
            result: offset === 0
                ? [
                    {
                        update_id: 1,
                        message: {
                            message_id: 101,
                            text: "/start",
                            chat: { id: 9001 },
                            from: { id: 1001 }
                        }
                    }
                ]
                : []
        };
    },
    async sendMessage(payload = {}) {
        sentMessages.push(payload);
        return {
            ok: true,
            result: payload
        };
    }
};

const disabledRuntime = await startProductionTelegramRuntime({
    token: "",
    adminIds: "1001",
    transport: mockTransport,
    keepAlive: false,
    installShutdown: false
});

assert.equal(disabledRuntime.telegram.runtime.status, "DISABLED");
assert.equal(disabledRuntime.telegram.runtime.reason, "TELEGRAM_BOT_TOKEN_MISSING");

const enabledRuntime = await startProductionTelegramRuntime({
    token: "mock-token",
    adminIds: "1001",
    transport: mockTransport,
    keepAlive: false,
    installShutdown: false
});

assert.equal(enabledRuntime.telegram.client.initialized, true);
assert.equal(enabledRuntime.telegram.runtime.status, "STARTED");

await new Promise(resolve => setTimeout(resolve, 50));

const startReply = enabledRuntime.telegram.orchestrator.processMessage({
    message: {
        userId: "1001",
        command: "/start",
        text: "/start",
        chatId: 9001
    }
});

assert.equal(startReply.status, "OK");
assert.ok(String(startReply.response.message).includes("ANNEXE AI TELEGRAM"));

enabledRuntime.telegram.stop();

console.log(JSON.stringify({
    status: "PASS",
    disabledRuntime: disabledRuntime.telegram.runtime.status,
    enabledRuntime: enabledRuntime.telegram.runtime.status,
    sentMessages: sentMessages.length
}, null, 2));
