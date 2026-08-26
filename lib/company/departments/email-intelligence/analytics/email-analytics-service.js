import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function defaultAnalytics() {
    return {
        emailsProcessed: 0,
        draftsCreated: 0,
        pendingApproval: 0,
        categories: {},
        departments: {},
        languages: {},
        updatedAt: null
    };
}

export default class EmailAnalyticsService {
    load(projectRoot = null) {
        if (!projectRoot) {
            return defaultAnalytics();
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "email-analytics.json");
        if (!fs.existsSync(filePath)) {
            return defaultAnalytics();
        }

        try {
            return JSON.parse(fs.readFileSync(filePath, "utf8"));
        }
        catch {
            return defaultAnalytics();
        }
    }

    update(input = {}, projectRoot = null) {
        const analytics = this.load(projectRoot);
        const email = input.email ?? {};
        const classification = input.classification ?? {};
        const route = input.route ?? {};
        const languageContext = input.languageContext ?? {};
        const approval = input.approval ?? {};

        analytics.emailsProcessed += 1;
        analytics.draftsCreated += input.reply?.status === "DRAFT" ? 1 : 0;
        analytics.pendingApproval += approval.status === "PENDING_APPROVAL" ? 1 : 0;
        analytics.categories[classification.category ?? "GENERAL"] = (analytics.categories[classification.category ?? "GENERAL"] ?? 0) + 1;
        analytics.departments[route.department ?? classification.department ?? "general"] = (analytics.departments[route.department ?? classification.department ?? "general"] ?? 0) + 1;
        analytics.languages[languageContext.language ?? "English"] = (analytics.languages[languageContext.language ?? "English"] ?? 0) + 1;
        analytics.updatedAt = new Date().toISOString();

        if (projectRoot) {
            const filePath = path.join(projectRoot, "reports", "company", "email", "email-analytics.json");
            writeJson(filePath, analytics);
            return {
                analytics,
                path: filePath
            };
        }

        return {
            analytics,
            path: null
        };
    }
}
