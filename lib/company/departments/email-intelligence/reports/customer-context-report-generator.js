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
        customersTracked: 0,
        conversationsAnalyzed: 0,
        intentsDetected: {},
        relationshipStages: {},
        updatedAt: null
    };
}

export default class CustomerContextReportGenerator {
    createReport(input = {}) {
        const customer = input.customer ?? {};
        const summary = input.summary ?? {};
        const intent = input.intent ?? {};
        const relationship = input.relationship ?? {};
        const memory = input.memory ?? {};

        return {
            reportId: `EMAIL-CTX-${Date.now()}`,
            customersTracked: input.customersTracked ?? 0,
            conversationsAnalyzed: input.conversationsAnalyzed ?? 0,
            intentsDetected: {
                [intent.intent ?? "GENERAL_INFORMATION"]: 1
            },
            relationshipStages: {
                [relationship.currentStage ?? customer.relationshipStage ?? "NEW_CONTACT"]: 1
            },
            customer,
            summary,
            intent,
            relationship,
            memory,
            generatedAt: new Date().toISOString()
        };
    }

    persist(report, projectRoot) {
        if (!projectRoot) {
            return { report, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "email", "customer-context-report.json");
        writeJson(filePath, report);
        return { report, path: filePath };
    }
}
