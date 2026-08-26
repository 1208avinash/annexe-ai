import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function defaultReport() {
    return {
        routedEmails: 0,
        employeesActivated: {},
        departmentsTriggered: {},
        actionsCreated: {},
        updatedAt: null,
        latestRoute: null,
        latestConnector: null
    };
}

function mergeCountMap(target = {}, source = {}) {
    const merged = { ...target };
    for (const [key, value] of Object.entries(source)) {
        merged[key] = (merged[key] ?? 0) + Number(value ?? 0);
    }
    return merged;
}

export default class EmployeeRoutingReportGenerator {
    createReport(input = {}) {
        const route = input.route ?? {};
        const connector = input.connector ?? {};

        return {
            reportId: `EMAIL-EMP-${Date.now()}`,
            routedEmails: input.routedEmails ?? 0,
            employeesActivated: {
                [route.employee ?? connector.employee ?? "AI CEO"]: 1
            },
            departmentsTriggered: {
                [route.department ?? connector.department ?? "ceo"]: 1
            },
            actionsCreated: {
                [route.action ?? connector.action ?? "executive_insight"]: 1
            },
            latestRoute: route,
            latestConnector: connector,
            classification: input.classification ?? null,
            intent: input.intent ?? null,
            customerContext: input.customerContext ?? null,
            generatedAt: new Date().toISOString()
        };
    }

    persist(report, projectRoot) {
        if (!projectRoot) {
            return { report, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "employee-routing-report.json");
        let existing = defaultReport();
        if (fs.existsSync(filePath)) {
            try {
                existing = JSON.parse(fs.readFileSync(filePath, "utf8"));
            }
            catch {
                existing = defaultReport();
            }
        }

        const merged = {
            ...existing,
            ...report,
            routedEmails: Number(existing.routedEmails ?? 0) + Number(report.routedEmails ?? 0),
            employeesActivated: mergeCountMap(existing.employeesActivated, report.employeesActivated),
            departmentsTriggered: mergeCountMap(existing.departmentsTriggered, report.departmentsTriggered),
            actionsCreated: mergeCountMap(existing.actionsCreated, report.actionsCreated),
            updatedAt: new Date().toISOString()
        };

        writeJson(filePath, merged);
        return { report: merged, path: filePath };
    }
}
