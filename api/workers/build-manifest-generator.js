// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 12.1
// Build Manifest Generator
// Converts engineering output into a BuildManifest
// ───────────────────────────────────────────────────────────────

import BuildManifest
    from "../artifacts/contracts/build-manifest.js";

import SourceFile
    from "../artifacts/contracts/source-file.js";

export default class BuildManifestGenerator {

    generate({

        projectId,

        executionId,

        task,

        generatedBy = "AI Engineer",

        files = []

    }) {

        const manifest = new BuildManifest({

            projectId,

            executionId,

            taskId:
                task?.taskId ?? task?.id ?? null,

            generatedBy

        });

        for (const file of files) {

            manifest.addArtifact(

                new SourceFile(file)

            );

        }

        return manifest;

    }

}