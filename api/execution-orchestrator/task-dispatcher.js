// ───────────────────────────────────────────────────────────────
// ANNEXE AI V5
// RC-7.3
// Task Dispatcher
// ───────────────────────────────────────────────────────────────

export default class TaskDispatcher {

    dispatch(job) {

        return {

            jobId: job.jobId,

            worker: job.worker,

            status: "DISPATCHED",

            dispatchedAt: new Date().toISOString()

        };

    }

}