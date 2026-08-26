import fs from "fs";
import path from "path";

function safeReadJson(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
    catch {
        return null;
    }
}

function safeReadText(filePath) {
    try {
        return fs.readFileSync(filePath, "utf8");
    }
    catch {
        return "";
    }
}

function exists(filePath) {
    try {
        return fs.existsSync(filePath);
    }
    catch {
        return false;
    }
}

export default class SystemInspector {
    inspect(input = {}) {
        const projectRoot = input.projectRoot ?? null;
        const backendRoot = projectRoot ? path.join(projectRoot, "backend") : null;
        const frontendRoot = projectRoot ? path.join(projectRoot, "frontend") : null;
        const packageJson = projectRoot ? safeReadJson(path.join(projectRoot, "package.json")) : null;
        const backendRequirementsText = backendRoot ? safeReadText(path.join(backendRoot, "requirements.txt")) : "";

        const framework = {
            backend: /fastapi/i.test(backendRequirementsText) ? "FastAPI" : "Unknown",
            frontend: packageJson?.dependencies?.react || packageJson?.devDependencies?.react ? "React" : "Unknown"
        };

        const database = {
            type: projectRoot && exists(path.join(projectRoot, "backend", "app", "database.py")) ? "SQLAlchemy" : "Unknown",
            files: []
        };

        const dependencies = {
            backend: backendRequirementsText
                .split(/\r?\n/)
                .map(line => line.trim())
                .filter(Boolean),
            frontend: packageJson ? [
                ...Object.keys(packageJson.dependencies ?? {}),
                ...Object.keys(packageJson.devDependencies ?? {})
            ] : []
        };

        const health = {
            backend: exists(projectRoot ? path.join(projectRoot, "backend", "app", "main.py") : ""),
            frontend: exists(projectRoot ? path.join(projectRoot, "frontend", "src", "App.jsx") : ""),
            packageManifest: Boolean(packageJson)
        };

        return {
            projectRoot,
            architecture: {
                backend: backendRoot ? "FastAPI" : "Unknown",
                frontend: frontendRoot ? "React/Vite" : "Unknown"
            },
            framework,
            database,
            dependencies,
            health,
            files: {
                packageJson: Boolean(packageJson),
                backendMain: exists(projectRoot ? path.join(backendRoot, "app", "main.py") : ""),
                frontendApp: exists(projectRoot ? path.join(frontendRoot, "src", "App.jsx") : "")
            },
            signals: {
                backendFrameworkDetected: framework.backend,
                frontendFrameworkDetected: framework.frontend
            },
            inspectedAt: new Date().toISOString()
        };
    }
}
