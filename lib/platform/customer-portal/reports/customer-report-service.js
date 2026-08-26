import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class CustomerReportService {
    createReport(input = {}) {
        return {
            reportId: `CUSTOS-${Date.now()}`,
            customerJourney: input.journey ?? [],
            revenueModel: input.billingModel ?? {},
            platformReadiness: input.platformReadiness ?? 0,
            saasCapabilities: input.saasCapabilities ?? [],
            customerProfile: input.customer ?? null,
            generatedAt: new Date().toISOString()
        };
    }

    persist(report, platformRoot, details = {}) {
        if (!platformRoot) {
            return { report, paths: null };
        }

        const reportDir = path.join(platformRoot, "reports", "platform");
        const paths = {
            customerOperatingSystem: path.join(reportDir, "commercial-operating-system-report.json"),
            commercialReadiness: path.join(reportDir, "commercial-readiness-report.json")
        };

        writeJson(paths.customerOperatingSystem, report);
        writeJson(paths.commercialReadiness, {
            platformReadinessPercent: report.platformReadiness,
            revenueModel: report.revenueModel,
            generatedAt: report.generatedAt,
            details
        });

        return { report, paths };
    }
}
