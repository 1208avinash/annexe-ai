// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 12.2
// Project Writer Integration Test
// ───────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";

import BuildManifestGenerator
    from "./api/workers/build-manifest-generator.js";

import ProjectWriter
    from "./api/project-writer/project-writer.js";

console.log("\n═══════════════════════════════════════════════");
console.log(" ANNEXE AI — Project Writer Test");
console.log("═══════════════════════════════════════════════\n");

try {

    // ----------------------------------------------------------
    // Generate Build Manifest
    // ----------------------------------------------------------

    const generator =
        new BuildManifestGenerator();

    const manifest =
        generator.generate({

            projectId: "PROJECT-001",

            executionId: "EXEC-001",

            task: {

                taskId: "TASK-001",

                title: "Create Login Page"

            },

            generatedBy: "AI Engineer",

            files: [

                {

                    path:
                        "frontend/src/pages/Login.jsx",

                    type:
                        "react-component",

                    language:
                        "javascript",

                    content:
`export default function Login() {
    return <div>Login</div>;
}`

                },

                {

                    path:
                        "frontend/src/pages/Login.css",

                    type:
                        "stylesheet",

                    language:
                        "css",

                    content:
`.login {
    display: flex;
}`

                },

                {

                    path:
                        "frontend/src/pages/Login.test.jsx",

                    type:
                        "unit-test",

                    language:
                        "javascript",

                    content:
`describe("Login", () => {

    test("renders", () => {

    });

});`

                }

            ]

        });

    console.log("✅ Build Manifest");

    // ----------------------------------------------------------
    // Write Project
    // ----------------------------------------------------------

    const writer =
        new ProjectWriter({

            workspaceRoot:
                "workspace"

        });

    const report =
        writer.write(manifest);

    console.log("✅ Project Written");

    // ----------------------------------------------------------
    // Validate Report
    // ----------------------------------------------------------

    if (!report.success)
        throw new Error("Write report failed.");

    if (report.filesWritten !== 3)
        throw new Error("Expected 3 files written.");

    // ----------------------------------------------------------
    // Validate Files Exist
    // ----------------------------------------------------------

    const projectRoot =
        path.join(

            "workspace",

            "PROJECT-001"

        );

    const expectedFiles = [

        "frontend/src/pages/Login.jsx",

        "frontend/src/pages/Login.css",

        "frontend/src/pages/Login.test.jsx"

    ];

    for (const file of expectedFiles) {

        const fullPath =
            path.join(projectRoot, file);

        if (!fs.existsSync(fullPath)) {

            throw new Error(

                `Missing file: ${fullPath}`

            );

        }

    }

    console.log("✅ Files Verified");

    // ----------------------------------------------------------
    // Summary
    // ----------------------------------------------------------

    console.log("\n══════════════════════════════════════");
    console.log(" PROJECT WRITER SUMMARY");
    console.log("══════════════════════════════════════");

    console.log("Project:",
        manifest.projectId);

    console.log("Manifest:",
        manifest.manifestId);

    console.log("Files Written:",
        report.filesWritten);

    console.log("Directories Created:",
        report.directoriesCreated);

    console.log("Workspace:",
        path.resolve(projectRoot));

    console.log("\nGenerated Files:");

    for (const file of report.written) {

        console.log(`  • ${file}`);

    }

    console.log("\n🎉 PROJECT WRITER PASSED\n");

}
catch (error) {

    console.error("\n❌ PROJECT WRITER FAILED\n");

    console.error(error);

    process.exit(1);

}