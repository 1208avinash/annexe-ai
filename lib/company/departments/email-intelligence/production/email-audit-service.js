import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function defaultAudit() {
    return {
        received: 0,
        processed: 0,
        draftsCreated: 0,
        blocked: 0
    };
}

export default class EmailAuditService {
    load(projectRoot = null) {
        if (!projectRoot) {
            return defaultAudit();
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "production-email-audit.json");
        if (!fs.existsSync(filePath)) {
            return defaultAudit();
        }

        try {
            return JSON.parse(fs.readFileSync(filePath, "utf8"));
        }
        catch {
            return defaultAudit();
        }
    }

    track(input = {}, projectRoot = null) {
        const audit = this.load(projectRoot);
        audit.received += Number(input.received ?? 0);
        audit.processed += Number(input.processed ?? 0);
        audit.draftsCreated += Number(input.draftsCreated ?? 0);
        audit.blocked += Number(input.blocked ?? 0);
        audit.updatedAt = new Date().toISOString();

        if (!projectRoot) {
            return { audit, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "production-email-audit.json");
        writeJson(filePath, audit);
        return { audit, path: filePath };
    }
}
