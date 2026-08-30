import assert from "assert/strict";

import TelegramClient from "./lib/company/departments/telegram-intelligence/bot/telegram-client.js";
import TelegramOrchestrator from "./lib/company/departments/telegram-intelligence/telegram-orchestrator.js";
import AdminAccessControl from "./lib/company/departments/telegram-intelligence/security/admin-access-control.js";

const sentMessages = [];
const runtimeUpdates = [
    {
        update_id: 1,
        message: {
            message_id: 11,
            text: "/status",
            chat: { id: 9001 },
            from: { id: 1001 }
        }
    }
];

const mockTransport = {
    async getUpdates({ offset = 0 } = {}) {
        return {
            ok: true,
            result: offset === 0 ? runtimeUpdates : []
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

const disabledClient = new TelegramClient({
    token: "",
    adminIds: "1001",
    transport: mockTransport
});
const disabledOrchestrator = new TelegramOrchestrator({
    client: disabledClient,
    accessControl: new AdminAccessControl({ adminIds: "1001" })
});

const disabledRuntime = await disabledOrchestrator.startRuntime({
    pollInterval: 10
});

assert.equal(disabledRuntime.status, "DISABLED");
assert.equal(disabledRuntime.reason, "TELEGRAM_BOT_TOKEN_MISSING");

const enabledClient = new TelegramClient({
    token: "mock-token",
    adminIds: "1001",
    transport: mockTransport
});
const enabledOrchestrator = new TelegramOrchestrator({
    client: enabledClient,
    accessControl: new AdminAccessControl({ adminIds: "1001" })
});

const bootstrap = enabledClient.initialize();
assert.equal(bootstrap.status, "INITIALIZED");
assert.equal(bootstrap.botTokenConfigured, true);

const runtime = await enabledOrchestrator.startRuntime({
    pollInterval: 10
});

assert.equal(runtime.status, "STARTED");
assert.equal(runtime.mode, "polling");

await new Promise(resolve => setTimeout(resolve, 30));

assert.ok(sentMessages.some(message => String(message.text ?? "").includes("ANNEXE AI STATUS")));

const adminCheck = enabledOrchestrator.accessControl.authorize({ userId: "1001" });
const blockedCheck = enabledOrchestrator.accessControl.authorize({ userId: "9999" });

assert.equal(adminCheck.authorized, true);
assert.equal(blockedCheck.authorized, false);

enabledOrchestrator.stopRuntime();

console.log(JSON.stringify({
    status: "PASS",
    runtimeStatus: runtime.status,
    sentMessages: sentMessages.length
}, null, 2));
