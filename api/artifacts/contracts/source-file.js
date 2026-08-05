// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 12.1
// Source File Contract
// Represents a generated software asset
// ───────────────────────────────────────────────────────────────

export default class SourceFile {

    constructor(data = {}) {

        // ------------------------------------------------------
        // Identity
        // ------------------------------------------------------

        this.fileId =
            data.fileId ??
            `FILE-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 8)}`;

        // ------------------------------------------------------
        // Location
        // ------------------------------------------------------

        this.path =
            data.path ?? "";

        this.fileName =
            data.fileName ??
            this.path.split("/").pop() ??
            "";

        // ------------------------------------------------------
        // Classification
        // ------------------------------------------------------

        this.type =
            data.type ?? "source";

        this.language =
            data.language ?? "text";

        // ------------------------------------------------------
        // Content
        // ------------------------------------------------------

        this.content =
            data.content ?? "";

        this.encoding =
            data.encoding ?? "utf8";

        // ------------------------------------------------------
        // File Options
        // ------------------------------------------------------

        this.overwrite =
            data.overwrite ?? true;

        this.executable =
            data.executable ?? false;

        // ------------------------------------------------------
        // Validation
        // ------------------------------------------------------

        this.checksum =
            data.checksum ?? null;

        this.size =
            data.size ??
            this.content.length;

        // ------------------------------------------------------
        // Metadata
        // ------------------------------------------------------

        this.metadata =
            data.metadata ?? {};

        this.generatedAt =
            data.generatedAt ??
            new Date().toISOString();

    }

    toJSON() {

        return {

            ...this

        };

    }

}