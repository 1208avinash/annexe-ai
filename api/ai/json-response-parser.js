// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 14.1
// JSON Response Parser
// AI Response → Source Files
// ───────────────────────────────────────────────────────────────

export default class JsonResponseParser {

    constructor() {

        this.allowedTypes = new Set([

            "react-component",
            "stylesheet",
            "unit-test",
            "api-route",
            "database-schema",
            "utility",
            "config",
            "documentation"

        ]);

    }

    parse(responseText) {

        if (!responseText)
            throw new Error(
                "AI response is empty."
            );

        let cleaned =
            responseText.trim();

        // ------------------------------------------------------
        // Remove Markdown code fences
        // ------------------------------------------------------

        cleaned = cleaned
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        // ------------------------------------------------------
        // Parse JSON
        // ------------------------------------------------------

        let parsed;

        try {

            parsed =
                JSON.parse(cleaned);

        }
        catch {

            throw new Error(
                "Invalid JSON returned by AI."
            );

        }

        // ------------------------------------------------------
        // Root Validation
        // ------------------------------------------------------

        if (!Array.isArray(parsed.files))
            throw new Error(
                "Root object must contain a files array."
            );

        // ------------------------------------------------------
        // File Validation
        // ------------------------------------------------------

        for (const file of parsed.files) {

            if (!file.path)
                throw new Error(
                    "File path missing."
                );

            if (!file.type)
                throw new Error(
                    `Missing type for ${file.path}`
                );

            if (
                !this.allowedTypes.has(file.type)
            )
                throw new Error(
                    `Unsupported file type '${file.type}'`
                );

            if (!file.language)
                throw new Error(
                    `Missing language for ${file.path}`
                );

            if (
                typeof file.content !== "string"
            )
                throw new Error(
                    `Missing content for ${file.path}`
                );

        }

        return parsed.files;

    }

}