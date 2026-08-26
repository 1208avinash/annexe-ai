import fs from "fs";
import path from "path";

function ensureDir(dirPath) {
    fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, value) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export default class ArchitectureReportGenerator {
    createReport(input = {}) {
        return {
            reportId: `ARCHREP-${Date.now()}`,
            projectId: input.projectId ?? null,
            frontend: input.solution?.frontendArchitecture ?? "React",
            backend: input.solution?.backendArchitecture ?? "FastAPI",
            database: input.database?.databaseRecommendation ?? "PostgreSQL",
            cloud: input.cloud?.cloudRecommendation ?? "AWS",
            security: input.security?.securityArchitecture?.join(" + ") ?? "RBAC + OAuth2",
            scaling: input.scaling?.scalingStrategy ?? "microservice ready",
            confidence: input.confidence ?? 95,
            solution: input.solution ?? null,
            cloudArchitecture: input.cloud ?? null,
            securityArchitecture: input.security ?? null,
            databaseArchitecture: input.database ?? null,
            integrationArchitecture: input.integration ?? null,
            scalingArchitecture: input.scaling ?? null,
            finalRecommendation: input.finalRecommendation ?? {
                frontend: "React",
                backend: "FastAPI",
                database: "PostgreSQL",
                cloud: "AWS",
                security: "RBAC + OAuth2",
                scaling: "microservice ready",
                confidence: 95
            },
            generatedAt: new Date().toISOString()
        };
    }

    persist(report, projectRoot) {
        if (!projectRoot) {
            return { report, path: null };
        }

        const filePath = path.join(projectRoot, "reports", "company", "architecture", "enterprise-architecture-report.json");
        writeJson(filePath, report);
        return { report, path: filePath };
    }
}
