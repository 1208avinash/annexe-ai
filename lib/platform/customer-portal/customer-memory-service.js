import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class CustomerMemoryService {
    store(input = {}) {
        const company = input.company ?? {};
        const memory = {
            customerProfile: {
                projectId: company.analysis?.projectId ?? null,
                projectName: company.analysis?.projectName ?? null,
                industry: company.analysis?.industry ?? null
            },
            companyDetails: {
                businessType: company.analysis?.businessType ?? null,
                applicationType: company.analysis?.applicationType ?? null
            },
            previousProjects: company.projects ?? [],
            preferences: {
                deployment: company.analysis?.deployment ?? null,
                security: company.analysis?.security ?? null
            },
            softwareHistory: company.reportPaths ?? {},
            upgradeHistory: [
                company.upgradeDepartment?.report?.reportId ?? null,
                company.evolutionDepartment?.report?.reportId ?? null
            ].filter(Boolean)
        };

        if (input.platformRoot) {
            writeJson(path.join(input.platformRoot, "reports", "platform", "customer-memory.json"), memory);
        }

        return memory;
    }
}
