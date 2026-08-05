// ───────────────────────────────────────────────────────────────
// ANNEXE AI V9
// Phase 12.2
// Write Report Contract
// Persistence Transaction Report
// ───────────────────────────────────────────────────────────────

export default class WriteReport {

    constructor(data = {}) {

        // ------------------------------------------------------
        // Identity
        // ------------------------------------------------------

        this.reportId =
            data.reportId ??
            `WRITE-${Date.now()}`;

        this.manifestId =
            data.manifestId ?? null;

        this.projectId =
            data.projectId ?? null;

        // ------------------------------------------------------
        // Status
        // ------------------------------------------------------

        this.success =
            data.success ?? true;

        this.message =
            data.message ?? "Write completed.";

        // ------------------------------------------------------
        // Statistics
        // ------------------------------------------------------

        this.filesWritten =
            data.filesWritten ?? 0;

        this.directoriesCreated =
            data.directoriesCreated ?? 0;

        this.skippedFiles =
            data.skippedFiles ?? 0;

        this.overwrittenFiles =
            data.overwrittenFiles ?? 0;

        this.failedFiles =
            data.failedFiles ?? 0;

        // ------------------------------------------------------
        // Details
        // ------------------------------------------------------

        this.written =
            data.written ?? [];

        this.skipped =
            data.skipped ?? [];

        this.overwritten =
            data.overwritten ?? [];

        this.errors =
            data.errors ?? [];

        // ------------------------------------------------------
        // Timing
        // ------------------------------------------------------

        this.startedAt =
            data.startedAt ??
            new Date().toISOString();

        this.completedAt =
            data.completedAt ?? null;

        this.durationMs =
            data.durationMs ?? 0;

    }

    addWritten(path) {

        this.written.push(path);
        this.filesWritten++;

    }

    addDirectory(path) {

        this.directoriesCreated++;

    }

    addSkipped(path) {

        this.skipped.push(path);
        this.skippedFiles++;

    }

    addOverwritten(path) {

        this.overwritten.push(path);
        this.overwrittenFiles++;

    }

    addError(path, error) {

        this.errors.push({

            path,

            error:
                error?.message ?? String(error)

        });

        this.failedFiles++;
        this.success = false;

    }

    complete() {

        this.completedAt =
            new Date().toISOString();

        this.durationMs =
            new Date(this.completedAt) -
            new Date(this.startedAt);

    }

    toJSON() {

        return {

            ...this

        };

    }

}