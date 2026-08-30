import { startProductionTelegramRuntime } from "./lib/platform/production-telegram-runtime.js";

const runtime = await startProductionTelegramRuntime({
    keepAlive: true,
    installShutdown: true
});

if (runtime.telegram.runtime.status === "DISABLED") {
    console.log("ANNEXE Telegram runtime disabled: TELEGRAM_BOT_TOKEN missing.");
}
else {
    console.log("ANNEXE Telegram runtime started.");
}
