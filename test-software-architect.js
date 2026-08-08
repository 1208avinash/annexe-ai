// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 15.2
// Software Architect Test
// Business Analysis → Engineering Specification
// ───────────────────────────────────────────────────────────────

import SoftwareArchitect
    from "./lib/architecture/software-architect.js";

console.log("\n═══════════════════════════════════════════════");
console.log(" ANNEXE AI — Software Architect Test");
console.log("═══════════════════════════════════════════════\n");

try {

    // ----------------------------------------------------------
    // Project
    // ----------------------------------------------------------

    const project = {

        projectId:
            "PROJECT-001",

        name:
            "ANNEXE CRM",

        description:
            "Enterprise CRM Platform"

    };

    console.log("✅ Project");

    // ----------------------------------------------------------
    // Business Analysis
    // ----------------------------------------------------------

    const businessAnalysis = {

        industry:
            "CRM",

        businessGoals: [

            "Manage customers",

            "Increase productivity",

            "Improve sales"

        ]

    };

    console.log("✅ Business Analysis");

    // ----------------------------------------------------------
    // Engineering Plan
    // ----------------------------------------------------------

    const engineeringPlan = {

        projectType:
            "Web Application",

        frontend:
            "React 19",

        backend:
            "FastAPI",

        database:
            "PostgreSQL",

        deployment:
            "Docker",

        functionalRequirements: [

            "Authentication",

            "Dashboard",

            "Customer Management",

            "Reporting"

        ],

        nonFunctionalRequirements: [

            "Scalable",

            "Secure",

            "Responsive"

        ],

        frontendModules: [

            "Login",

            "Dashboard",

            "Customers"

        ],

        backendServices: [

            "Auth API",

            "Customer API"

        ],

        entities: [

            "User",

            "Customer"

        ],

        endpoints: [

            "/login",

            "/customers"

        ],

        authentication:
            "JWT",

        authorization:
            "RBAC",

        securityRequirements: [

            "Password Hashing",

            "Rate Limiting"

        ],

        acceptanceCriteria: [

            "Authentication works",

            "Dashboard loads",

            "CRUD operations succeed"

        ]

    };

    console.log("✅ Engineering Plan");

    // ----------------------------------------------------------
    // Architect
    // ----------------------------------------------------------

    const architect =
        new SoftwareArchitect();

    const specification =
        architect.createSpecification({

            project,

            businessAnalysis,

            engineeringPlan

        });

    // ----------------------------------------------------------
    // Validation
    // ----------------------------------------------------------

    if (!specification)
        throw new Error(
            "Specification missing."
        );

    if (!specification.project.name)
        throw new Error(
            "Project missing."
        );

    if (!specification.frontend.framework)
        throw new Error(
            "Frontend missing."
        );

    if (!specification.backend.framework)
        throw new Error(
            "Backend missing."
        );

    if (!specification.database.engine)
        throw new Error(
            "Database missing."
        );

    console.log("✅ Engineering Specification");

    // ----------------------------------------------------------
    // Summary
    // ----------------------------------------------------------

    console.log("\n══════════════════════════════════════");
    console.log(" ENGINEERING SPECIFICATION SUMMARY");
    console.log("══════════════════════════════════════");

    console.log(
        "Specification:",
        specification.specificationId
    );

    console.log(
        "Project:",
        specification.project.name
    );

    console.log(
        "Domain:",
        specification.project.domain
    );

    console.log(
        "Frontend:",
        specification.frontend.framework
    );

    console.log(
        "Backend:",
        specification.backend.framework
    );

    console.log(
        "Database:",
        specification.database.engine
    );

    console.log(
        "Authentication:",
        specification.security.authentication
    );

    console.log(
        "Authorization:",
        specification.security.authorization
    );

    console.log(
        "Deployment:",
        specification.deployment.platform
    );

    console.log(
        "Business Goals:",
        specification.businessGoals.length
    );

    console.log(
        "Functional Requirements:",
        specification.functionalRequirements.length
    );

    console.log(
        "Security Requirements:",
        specification.security.requirements.length
    );

    console.log(
        "Acceptance Criteria:",
        specification.acceptanceCriteria.length
    );

    console.log("\n🎉 SOFTWARE ARCHITECT PASSED\n");

}
catch (error) {

    console.error("\n❌ SOFTWARE ARCHITECT FAILED\n");

    console.error(error);

    process.exit(1);

}