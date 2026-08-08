// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-6.2.1
// Engineering Memory Platform
// Memory Validator
// ───────────────────────────────────────────────────────────────

import {
    isValidMemoryDomain,
    isValidMemoryCategory
} from "./memory-types.js";

export function validateMemoryRecord(record) {

    const errors = [];

    if (!record.title || record.title.trim() === "") {
        errors.push("Title is required.");
    }

    if (!isValidMemoryDomain(record.domain)) {
        errors.push("Invalid memory domain.");
    }

    if (!isValidMemoryCategory(record.category)) {
        errors.push("Invalid memory category.");
    }

    if (
        typeof record.confidence !== "number" ||
        record.confidence < 0 ||
        record.confidence > 1
    ) {
        errors.push("Confidence must be between 0 and 1.");
    }

    return {

        valid: errors.length === 0,

        errors

    };

}