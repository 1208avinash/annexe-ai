// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-6.1
// Requirement Intelligence
// Public Entry Point
// ───────────────────────────────────────────────────────────────

import worker from "./worker.js";

export async function analyzeRequirement(input = {}) {

    return await worker.run(input);

}

export { worker };

export default {

    analyzeRequirement,

    worker

};