// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 13.2
// Engineering Prompt Builder
// Engineering Context → Engineering Prompt
// ───────────────────────────────────────────────────────────────

import EngineeringPrompt
    from "./contracts/engineering-prompt.js";

export default class PromptBuilder {

    build(context) {

        if (!context)
            throw new Error(
                "Engineering context is required."
            );

        const sections = [];

        // ------------------------------------------------------
        // System Instructions
        // ------------------------------------------------------

        sections.push(
`You are ANNEXE AI.

You are a senior software engineer.

Generate production-ready software.

Follow the supplied architecture exactly.

Never redesign the architecture.

Return only the requested implementation.`
        );

        // ------------------------------------------------------
        // Project
        // ------------------------------------------------------

        sections.push(
`PROJECT

Name:
${context.project.name}

Description:
${context.project.description}`
        );

        // ------------------------------------------------------
        // Architecture
        // ------------------------------------------------------

        sections.push(
`ARCHITECTURE

Frontend:
${context.architecture.frontend}

Backend:
${context.architecture.backend}

Database:
${context.architecture.database}

Deployment:
${context.architecture.deployment}`
        );

        // ------------------------------------------------------
        // Engineering Standards
        // ------------------------------------------------------

        sections.push(
`ENGINEERING STANDARDS

Language:
${context.standards.language}

Framework:
${context.standards.framework}

Testing:
${context.standards.testing}

Formatting:
${context.standards.formatting}

Linting:
${context.standards.linting}`
        );

        // ------------------------------------------------------
        // Repository Context
        // ------------------------------------------------------

        sections.push(
`KNOWN PROJECT FILES

${context.repository.existingFiles.join("\n")}`
        );

        // ------------------------------------------------------
        // Task
        // ------------------------------------------------------

        sections.push(
`TASK

${context.task.title}

${context.task.description}

Requirements:

${context.task.requirements.join("\n")}`
        );

        // ------------------------------------------------------
// Output Requirements
// ------------------------------------------------------

sections.push(
`OUTPUT REQUIREMENTS

Return ONLY valid JSON.

Do NOT return:

- Markdown
- Triple backticks
- Explanations
- Notes
- Comments
- Natural language

The response MUST exactly match this schema:

{
  "files": [
    {
      "path": "string",
      "type": "string",
      "language": "string",
      "content": "string"
    }
  ]
}

Rules:

1. Every generated source file MUST appear in the files array.

2. The path must be relative to the project root.

3. Content must contain the complete file.

4. Do not truncate code.

5. Escape JSON correctly.

6. Return valid JSON only.

7. The root object must contain exactly one property named "files".`
);

        const promptText =
            sections.join("\n\n----------------------------------------\n\n");

        return new EngineeringPrompt({

            engineeringContext: context,

            task: context.task,

            systemInstructions:
                sections[0],

            outputRequirements: {

                productionReady: true,

                explanation: false

            },

            responseFormat: {

                type:
                    "source-files"

            },

            prompt:
                promptText

        });

    }

}