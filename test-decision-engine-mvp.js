import assert from "assert";

import KnowledgeEngine from "./lib/engineering-brain/knowledge-engine.js";
import EvidenceEngine from "./lib/engineering-brain/evidence-engine.js";
import RecommendationBuilder from "./lib/engineering-brain/recommendation-builder.js";
import ConfidenceEngine from "./lib/engineering-brain/confidence-engine.js";
import DecisionEngine from "./lib/decision-engine/decision-engine.js";

import {
    MemoryManager,
    MemoryDomain
} from "./lib/engineering-memory/index.js";

let passed = 0;
let failed = 0;

function test(name, fn) {

    try {

        fn();

        console.log(`✅ ${name}`);

        passed++;

    }

    catch (err) {

        console.log(`❌ ${name}`);

        console.error(err);

        failed++;

    }

}

console.log("");
console.log("══════════════════════════════════════");
console.log(" DECISION ENGINE MVP TEST");
console.log("══════════════════════════════════════");
console.log("");

// ----------------------------------------------------
// Engineering Memory
// ----------------------------------------------------

const memory = new MemoryManager();

memory.createMemory({

    title: "CRM Architecture",

    description: "Reusable CRM architecture.",

    domain: MemoryDomain.PATTERN,

    confidence: 0.95

});

memory.createMemory({

    title: "JWT Authentication",

    description: "Authentication module.",

    domain: MemoryDomain.COMPONENT,

    confidence: 0.90

});

// ----------------------------------------------------
// Engines
// ----------------------------------------------------

const knowledgeEngine = new KnowledgeEngine(memory);

const evidenceEngine = new EvidenceEngine();

const recommendationBuilder = new RecommendationBuilder();

const confidenceEngine = new ConfidenceEngine();

const decisionEngine = new DecisionEngine();

// ----------------------------------------------------
// Requirement
// ----------------------------------------------------

const requirement = {

    projectId: "CRM-001",

    summary: "Build CRM for Logistics"

};

let knowledge;
let evidence;
let recommendation;
let confidence;
let decision;

// ----------------------------------------------------
// Pipeline
// ----------------------------------------------------

test("Knowledge Retrieved", () => {

    knowledge = knowledgeEngine.retrieveKnowledge("crm");

    assert.ok(knowledge.records.length > 0);

});

test("Evidence Generated", () => {

    evidence = evidenceEngine.build(knowledge);

    assert.ok(evidence.total > 0);

});

test("Recommendation Built", () => {

    recommendation = recommendationBuilder.build(

        requirement,

        knowledge,

        evidence

    );

    assert.ok(recommendation.architecture);

});

test("Confidence Calculated", () => {

    confidence = confidenceEngine.evaluate(

        recommendation,

        evidence

    );

    recommendation.confidence = confidence.confidence;

    assert.ok(confidence.confidence > 0);

});

test("Decision Generated", () => {

    decision = decisionEngine.decide(recommendation);

    assert.equal(decision.approved, true);

    assert.ok(decision.decisionConfidence > 0);

});

// ----------------------------------------------------

console.log("");
console.log("══════════════════════════════════════");
console.log(" DECISION ENGINE MVP RESULT");
console.log("══════════════════════════════════════");
console.log("");

console.log(`Passed : ${passed}`);
console.log(`Failed : ${failed}`);

console.log("");

if (failed === 0) {

    console.log("✅ PASS");

    console.log("");

    console.log("Decision Engine MVP Operational");

} else {

    console.log("❌ FAIL");

    process.exit(1);

}

console.log("");
console.log("══════════════════════════════════════");