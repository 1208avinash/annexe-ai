function normalizeText(value) {
    return String(value ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

export default class SolutionArchitectAgent {
    generate(input = {}) {
        const text = normalizeText(input.requestText ?? input.analysis?.requestText ?? "");
        const productStrategy = input.productDepartment?.productStrategy ?? {};
        const frontendArchitecture = text.includes("crm") ? "React application with routed views and shared UI components" : "React application with modular pages";
        const backendArchitecture = "FastAPI service layer with REST endpoints and service boundaries";
        const apiDesign = [
            "Authentication API",
            "Customer API",
            "Dashboard API",
            "Reporting API"
        ];
        const serviceBoundaries = [
            "Identity and access",
            "Customer operations",
            "Analytics and reporting",
            "Workflow orchestration"
        ];
        const moduleStructure = [
            "frontend",
            "backend",
            "services",
            "repositories",
            "schemas",
            "routers"
        ];

        return {
            frontendArchitecture,
            backendArchitecture,
            apiDesign,
            serviceBoundaries,
            moduleStructure,
            productVision: productStrategy.vision ?? null
        };
    }
}
