// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 12.2
// Project Writer
// BuildManifest → Workspace
// ───────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";

import WriteReport
    from "./contracts/write-report.js";

export default class ProjectWriter {

    constructor(options = {}) {

        this.workspaceRoot =
            options.workspaceRoot ??
            "workspace";

    }

    write(manifest) {

        if (!manifest)
            throw new Error("BuildManifest is required.");

        const report =
            new WriteReport({

                manifestId:
                    manifest.manifestId,

                projectId:
                    manifest.projectId

            });

        const projectRoot =
            path.join(

                this.workspaceRoot,

                manifest.projectId

            );

        if (!fs.existsSync(projectRoot)) {

            fs.mkdirSync(

                projectRoot,

                {

                    recursive: true

                }

            );

            report.addDirectory(projectRoot);

        }

        for (const file of manifest.artifacts) {

            const outputPath =
                path.join(

                    projectRoot,

                    file.path

                );

            const directory =
                path.dirname(outputPath);

            if (!fs.existsSync(directory)) {

                fs.mkdirSync(

                    directory,

                    {

                        recursive: true

                    }

                );

                report.addDirectory(directory);

            }

            if (

                fs.existsSync(outputPath) &&

                file.overwrite === false

            ) {

                report.addSkipped(outputPath);

                continue;

            }

            if (

                fs.existsSync(outputPath) &&

                file.overwrite === true

            ) {

                report.addOverwritten(outputPath);

            }

            try {

                fs.writeFileSync(

                    outputPath,

                    file.content,

                    {

                        encoding:

                            file.encoding ??

                            "utf8"

                    }

                );

                report.addWritten(outputPath);

            }
            catch (error) {

                report.addError(

                    outputPath,

                    error

                );

            }

        }

        report.complete();

        return report;

    }

}