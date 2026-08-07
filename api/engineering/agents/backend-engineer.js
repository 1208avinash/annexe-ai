// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 18.6
// Backend Engineer
// Autonomous Backend Software Engineer
// ───────────────────────────────────────────────────────────────

import AIEngineer
    from "./ai-engineer.js";

export default class BackendEngineer extends AIEngineer {

    constructor(data = {}) {

        super({

            ...data,

            name:
                data.name ??
                "Backend Engineer",

            role:
                "Backend Engineer",

            department:
                "Backend Engineering",

            capabilities: [

                "FastAPI",

                "Node.js",

                "Express",

                "REST API",

                "GraphQL",

                "PostgreSQL",

                "Authentication",

                "Authorization",

                "Microservices"

            ]

        });

    }

    // ----------------------------------------------------------
    // Domain Prompt
    // ----------------------------------------------------------

    getSystemPrompt() {

        return `

You are a Senior Backend Engineer.

Produce production-ready backend code.

Requirements:

• Clean Architecture
• SOLID Principles
• REST Best Practices
• Security First
• Production Ready
• Generate valid JSON only.

`;

    }

    // ----------------------------------------------------------
    // Domain
    // ----------------------------------------------------------

    getTaskType() {

        return "backend";

    }

    // ----------------------------------------------------------
    // Validation
    // ----------------------------------------------------------

    validateOutput(generation) {

        return (

            generation &&

            generation.success &&

            generation.generatedFiles?.length > 0

        );

    }

}