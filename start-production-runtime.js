import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function parseEnvFile(contents = "") {
    const result = {};
    for (const rawLine of String(contents).split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) {
            continue;
        }

        const equalsIndex = line.indexOf("=");
        if (equalsIndex === -1) {
            continue;
        }

        const key = line.slice(0, equalsIndex).trim();
        if (!key || Object.prototype.hasOwnProperty.call(process.env, key)) {
            continue;
        }

        let value = line.slice(equalsIndex + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        result[key] = value.replace(/\\n/g, "\n");
    }

    return result;
}

function loadEnvFiles() {
    const rootDir = path.dirname(fileURLToPath(import.meta.url));
    const envFiles = [".env", ".env.local"];

    for (const name of envFiles) {
        const filePath = path.join(rootDir, name);
        if (!fs.existsSync(filePath)) {
            continue;
        }

        const parsed = parseEnvFile(fs.readFileSync(filePath, "utf8"));
        for (const [key, value] of Object.entries(parsed)) {
            if (process.env[key] == null || process.env[key] === "") {
                process.env[key] = value;
            }
        }
    }
}

loadEnvFiles();

const { startProductionTelegramRuntime } = await import("./lib/platform/production-telegram-runtime.js");

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
