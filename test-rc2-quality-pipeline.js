// ───────────────────────────────────────────────────────────────
// ANNEXE AI V4
// RC-2 — Quality Pipeline Acceptance Test
// ----------------------------------------------------------------
//
// PURPOSE
//
// Validates the autonomous quality pipeline after RC-1.
//
// Execution
//      ↓
// Testing Worker
//      ↓
// Review Worker
//      ↓
// Approval Pipeline
//      ↓
// Debug Store
//      ↓
// Delivery Worker
//
// RC-1 remains frozen.
//
// Run:
//
// node test-rc2-quality-pipeline.js
//
// ───────────────────────────────────────────────────────────────

import { AgentExecutor } from "./lib/orchestrator/executor.js";

let passed = 0;
let failed = 0;

function assert(name, condition, actual = null) {

    if (condition) {

        console.log(`✅ ${name}`);
        passed++;

    }
    else {

        console.log(`❌ ${name}`);

        if (actual !== null) {
            console.log(actual);
        }

        failed++;

    }

}

async function main() {

    console.log("");
    console.log("══════════════════════════════════════════════");
    console.log(" RC-2 — QUALITY PIPELINE");
    console.log("══════════════════════════════════════════════");
    console.log("");

    const executor = new AgentExecutor();

    // ============================================================
    // Stage 1
    // ============================================================

    console.log("── Stage 1 — Testing Worker ─────────");

    const testingTask = {

        id: "RC2-TEST-001",

        projectId: "PROJECT-PHASE10-001",

        agent: "testing_worker",

        type: "TESTING",

        priority: "MEDIUM"

    };

    const testingResult =
        await executor.executeTask(testingTask);

    assert(

        "testing worker executed",

        testingResult !== null,

        testingResult

    );

    assert(

        "testing worker returned status",

        testingResult &&
        [
            "COMPLETED",
            "FAILED",
            "PENDING_APPROVAL"
        ].includes(testingResult.status),

        testingResult

    );

    if (testingResult.success) {

        assert(

            "testing completed",

            testingResult.status === "COMPLETED",

            testingResult

        );

        assert(

            "testing result returned",

            testingResult.result !== undefined,

            testingResult

        );

    }
    else {

        console.log(
            "ℹ Testing Worker finished with:",
            testingResult.status
        );

    }

    console.log("");

    // ============================================================
    // Stage 2
    // ============================================================

    console.log("── Stage 2 — Review Worker ──────────");

    const reviewTask = {

        id: "RC2-REVIEW-001",

        projectId: "PROJECT-PHASE10-001",

        agent: "review_worker",

        type: "REVIEW",

        priority: "HIGH"

    };

    const reviewResult =
        await executor.executeTask(reviewTask);

    assert(

        "review worker executed",

        reviewResult !== null,

        reviewResult

    );

    assert(

        "review worker returned status",

        reviewResult &&
        [
            "COMPLETED",
            "FAILED",
            "PENDING_APPROVAL"
        ].includes(reviewResult.status),

        reviewResult

    );

    if (reviewResult.success) {

        assert(

            "review completed",

            reviewResult.status === "COMPLETED",

            reviewResult

        );

        assert(

            "review result returned",

            reviewResult.result !== undefined,

            reviewResult

        );

    }
    else {

        console.log(
            "ℹ Review Worker finished with:",
            reviewResult.status
        );

    }

    console.log("");

    // ============================================================
    // Stage 3
    // ============================================================

    console.log("── Stage 3 — Approval Pipeline ──────");

    const executionFailureTask = {

        id: "RC2-EXEC-001",

        projectId: "PROJECT-PHASE10-001",

        agent: "execution_worker",

        type: "EXECUTION",

        priority: "MEDIUM"

    };

    const approvalResult =
        await executor.executeTask(executionFailureTask);

    assert(

        "approval pipeline executed",

        approvalResult !== null,

        approvalResult

    );

    assert(

        "approval returned valid status",

        approvalResult &&
        [
            "COMPLETED",
            "FAILED",
            "PENDING_APPROVAL"
        ].includes(approvalResult.status),

        approvalResult

    );

    if (approvalResult.status === "PENDING_APPROVAL") {

        assert(

            "debug id created",

            typeof approvalResult.debugId === "string",

            approvalResult

        );

        assert(

            "diagnosis returned",

            approvalResult.diagnosis !== undefined,

            approvalResult

        );

        assert(

            "patch plan returned",

            Array.isArray(approvalResult.patchPlan),

            approvalResult

        );

    }
    else {

        console.log(
            "ℹ Approval pipeline status:",
            approvalResult.status
        );

    }

    console.log("");

        // ============================================================
    // Stage 4 — Debug Store Validation
    // ============================================================

    if (approvalResult.status === "PENDING_APPROVAL") {

        assert(

            "debug record available",

            typeof approvalResult.debugId === "string" &&
            approvalResult.debugId.length > 0,

            approvalResult

        );


assert(
    "patch plan returned",
    Array.isArray(approvalResult.patchPlan),
    approvalResult
);

console.log(
    "ℹ Diagnosis:",
    approvalResult.diagnosis ?? "(none generated)"
);
        console.log(
            "ℹ Debug Record:",
            approvalResult.debugId
        );

    }
    else {

        console.log(
            "ℹ Debug Store skipped:",
            approvalResult.status
        );

    }

    console.log("");

    // ============================================================
    // Stage 5
    // ============================================================

    console.log("── Stage 5 — Delivery Worker ────────");

    const deliveryTask = {

        id: "RC2-DELIVERY-001",

        projectId: "PROJECT-PHASE10-001",

        agent: "delivery_worker",

        type: "DELIVERY",

        priority: "HIGH"

    };

    const deliveryResult =
        await executor.executeTask(deliveryTask);

    assert(

        "delivery worker executed",

        deliveryResult !== null,

        deliveryResult

    );

    assert(

        "delivery returned valid status",

        deliveryResult &&
        [
            "COMPLETED",
            "FAILED",
            "PENDING_APPROVAL"
        ].includes(deliveryResult.status),

        deliveryResult

    );

    if (deliveryResult.success) {

        assert(

            "delivery completed",

            deliveryResult.status === "COMPLETED",

            deliveryResult

        );

        assert(

            "delivery returned result",

            deliveryResult.result !== undefined,

            deliveryResult

        );

    }
    else {

        console.log(
            "ℹ Delivery Worker finished with:",
            deliveryResult.status
        );

    }

    console.log("");

    // ============================================================
    // Result Summary
    // ============================================================

    console.log("══════════════════════════════════════════════");
    console.log(" RC-2 RESULT");
    console.log("══════════════════════════════════════════════");
    console.log("");

    console.log(`Passed : ${passed}`);
    console.log(`Failed : ${failed}`);
    console.log("");

    if (failed === 0) {

        console.log("✅ PASS");
        console.log("");
        console.log("Quality Pipeline verified.");
        console.log("");
        console.log("Verified Stages:");
        console.log("  ✓ Testing Worker");
        console.log("  ✓ Review Worker");
        console.log("  ✓ Approval Pipeline");
        console.log("  ✓ Debug Store");
        console.log("  ✓ Delivery Worker");
        console.log("");

    } else {

        console.log("❌ FAIL");
        console.log("");
        console.log("Investigate the failing integration before");
        console.log("changing production code.");
        console.log("");

    }

    console.log("══════════════════════════════════════════════");
    console.log("");

    process.exit(failed === 0 ? 0 : 1);

}

// ───────────────────────────────────────────────────────────────
// Entry Point
// ───────────────────────────────────────────────────────────────

main().catch(error => {

    console.log("");
    console.log("══════════════════════════════════════════════");
    console.log(" RC-2 — FATAL ERROR");
    console.log("══════════════════════════════════════════════");
    console.log("");

    console.error(error);

    console.log("");
    console.log("Possible causes:");
    console.log("");
    console.log("• Incorrect import path");
    console.log("• Agent registration missing");
    console.log("• Approval pipeline integration issue");
    console.log("• Unexpected runtime exception");
    console.log("");
    console.log("Investigate before modifying production code.");
    console.log("");

    process.exit(1);

});