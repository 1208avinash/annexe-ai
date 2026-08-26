export default class EmailRateLimiter {
    constructor({ maxProcessingCount = 10 } = {}) {
        this.maxProcessingCount = Number(maxProcessingCount ?? 10);
        this.processedCount = 0;
    }

    allow() {
        const allowed = this.processedCount < this.maxProcessingCount;
        if (allowed) {
            this.processedCount += 1;
        }

        return {
            allowed,
            processedCount: this.processedCount,
            maxProcessingCount: this.maxProcessingCount
        };
    }
}
