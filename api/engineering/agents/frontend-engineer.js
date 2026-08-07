// ───────────────────────────────────────────────────────────────
// ANNEXE AI V10
// Phase 18.3
// Frontend Engineer
// Autonomous Frontend Software Engineer
// ───────────────────────────────────────────────────────────────

import Engineer
    from "./engineer.js";

export default class FrontendEngineer extends Engineer {

    constructor(data = {}) {

        super({

            ...data,

            name:
                data.name ??
                "Frontend Engineer",

            role:
                "Frontend Engineer",

            department:
                "Frontend Engineering",

            capabilities: [

                "React",

                "Next.js",

                "TypeScript",

                "Tailwind CSS",

                "HTML",

                "CSS",

                "Responsive Design",

                "Accessibility"

            ]

        });

    }

    // ----------------------------------------------------------
    // Execute Engineering Task
    // ----------------------------------------------------------

    async execute(task) {

        if (!task)
            throw new Error(
                "EngineeringTask is required."
            );

        this.assign(task);

        task.start();

        try {

            // --------------------------------------------------
            // Select AI Model
            // --------------------------------------------------

            const model =

                this.modelRouter.select({

                    taskType:
                        "frontend",

                    freePreferred:
                        task.freePreferred,

                    requiresJson:
                        true

                });

            if (!model)
                throw new Error(
                    "No frontend model available."
                );

            // --------------------------------------------------
            // Build Prompt
            // --------------------------------------------------

            const engineeringPrompt =

                this.promptBuilder.build({

                    systemInstructions: `

You are a Senior Frontend Engineer.

Produce production-ready frontend code.

Follow React best practices.

Generate valid JSON only.

`,

                    prompt:

`${task.title}

${task.description}

Requirements:

${task.requirements.join("\n")}

Acceptance Criteria:

${task.acceptanceCriteria.join("\n")}`

                });

            // --------------------------------------------------
            // AI Generation
            // --------------------------------------------------

            const generation =

                await this.generationEngine.generate({

                    provider:
                        model.providerId ??
                        model.provider.toLowerCase(),

                    engineeringPrompt

                });

            if (!generation.success)
                throw new Error(
                    generation.message
                );

            task.generatedFiles =
                generation.generatedFiles;

            task.complete({

                files:
                    generation.generatedFiles

            });

            this.complete();

            return {

                engineer:
                    this.role,

                model:
                    model.slug,

                success:
                    true,

                generatedFiles:
                    generation.generatedFiles

            };

        }
        catch (error) {

            task.fail(
                error.message
            );

            this.fail();

            throw error;

        }

    }

}