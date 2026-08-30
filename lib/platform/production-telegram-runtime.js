import { createProductionRuntime } from "./production-runtime.js";
import TelegramClient from "../company/departments/telegram-intelligence/bot/telegram-client.js";
import TelegramOrchestrator from "../company/departments/telegram-intelligence/telegram-orchestrator.js";
import AdminAccessControl from "../company/departments/telegram-intelligence/security/admin-access-control.js";

let shutdownHandlersInstalled = false;

function parseAdminIds(value = "") {
    return String(value)
        .split(",")
        .map(item => item.trim())
        .filter(Boolean)
        .join(",");
}

function installShutdownHandlers(stop) {
    if (shutdownHandlersInstalled || typeof process === "undefined") {
        return;
    }

    shutdownHandlersInstalled = true;

    const shutdown = async () => {
        try {
            await stop();
        }
        catch {
            // Best effort shutdown only.
        }
    };

    process.once("SIGINT", () => {
        void shutdown().finally(() => process.exit(0));
    });

    process.once("SIGTERM", () => {
        void shutdown().finally(() => process.exit(0));
    });
}

export async function startProductionTelegramRuntime({
    workspaceRoot = "workspace",
    token = process.env.TELEGRAM_BOT_TOKEN ?? "",
    adminIds = process.env.TELEGRAM_ADMIN_IDS ?? "",
    pollInterval = Number(process.env.TELEGRAM_POLL_INTERVAL ?? 1000),
    keepAlive = true,
    transport = null,
    installShutdown = true
} = {}) {
    const runtime = createProductionRuntime({ workspaceRoot });
    const telegramAdminIds = parseAdminIds(adminIds);
    const client = new TelegramClient({
        token,
        adminIds: telegramAdminIds,
        transport
    });
    const orchestrator = new TelegramOrchestrator({
        client,
        accessControl: new AdminAccessControl({ adminIds: telegramAdminIds })
    });

    const telegramRuntime = await orchestrator.startRuntime({
        pollInterval,
        keepAlive
    });

    if (installShutdown && token) {
        installShutdownHandlers(() => orchestrator.stopRuntime());
    }

    return {
        success: true,
        runtime,
        telegram: {
            client,
            orchestrator,
            runtime: telegramRuntime,
            stop: () => orchestrator.stopRuntime()
        }
    };
}
