import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function defaultDashboard() {
    return {
        inbox: {
            total: 0,
            processed: 0,
            pendingApproval: 0
        },
        priority: {
            high: 0,
            medium: 0,
            low: 0
        },
        securityAlerts: 0
    };
}

function normalizePriority(value = "low") {
    const priority = String(value).toLowerCase();
    if (priority === "high" || priority === "critical") {
        return "high";
    }
    if (priority === "medium") {
        return "medium";
    }
    return "low";
}

export default class EmailDashboardService {
    load(projectRoot = null) {
        if (!projectRoot) {
            return defaultDashboard();
        }

        const reportPath = path.join(projectRoot, "reports", "company", "email", "command-center-email-report.json");
        if (!fs.existsSync(reportPath)) {
            return defaultDashboard();
        }

        try {
            const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
            return report.dashboard ?? defaultDashboard();
        }
        catch {
            return defaultDashboard();
        }
    }

    summarize(input = {}, projectRoot = null) {
        const dashboard = this.load(projectRoot);
        const analytics = input.analytics ?? {};
        const approval = input.approval ?? {};
        const classification = input.classification ?? {};
        const route = input.route ?? {};
        const security = input.security ?? {};

        dashboard.inbox.total = Number(analytics.emailsProcessed ?? dashboard.inbox.total ?? 0);
        dashboard.inbox.processed = Number(analytics.emailsProcessed ?? dashboard.inbox.processed ?? 0);
        dashboard.inbox.pendingApproval = Number(analytics.pendingApproval ?? dashboard.inbox.pendingApproval ?? 0);
        dashboard.priority[normalizePriority(route.priority ?? classification.priority)] += 1;
        dashboard.securityAlerts = Number(dashboard.securityAlerts ?? 0) + ((security.spamIndicators ?? []).length + (security.suspiciousLinks ?? []).length > 0 ? 1 : 0);
        dashboard.latestApprovalStatus = approval.status ?? null;
        dashboard.latestRoute = route ?? null;
        dashboard.updatedAt = new Date().toISOString();

        if (!projectRoot) {
            return { dashboard, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "email-dashboard.json");
        writeJson(filePath, dashboard);
        return { dashboard, path: filePath };
    }
}
