import assert from "assert";

import KnowledgeEngine from "./api/engineering-brain/knowledge-engine.js";
import EvidenceEngine from "./api/engineering-brain/evidence-engine.js";
import RecommendationBuilder from "./api/engineering-brain/recommendation-builder.js";
import ConfidenceEngine from "./api/engineering-brain/confidence-engine.js";

import {
    MemoryManager,
    MemoryDomain
} from "./api/engineering-memory/index.js";

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
console.log(" ENGINEERING BRAIN MVP TEST");
console.log("══════════════════════════════════════");
console.log("");

// ----------------------------------------------------
// Create Engineering Memory
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

    description: "Reusable authentication.",

    domain: MemoryDomain.COMPONENT,

    confidence: 0.90

});

// ----------------------------------------------------
// Create Brain Components
// ----------------------------------------------------

const knowledgeEngine = new KnowledgeEngine(memory);

const evidenceEngine = new EvidenceEngine();

const recommendationBuilder = new RecommendationBuilder();

const confidenceEngine = new ConfidenceEngine();

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

// ----------------------------------------------------
// Tests
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

    assert.equal(recommendation.backend, "Node.js");

    assert.equal(recommendation.frontend, "React");

    assert.equal(recommendation.database, "PostgreSQL");

});

test("Confidence Calculated", () => {

    confidence = confidenceEngine.evaluate(

        recommendation,

        evidence

    );

    assert.ok(confidence.confidence > 0);

});

// ----------------------------------------------------
// Result
// ----------------------------------------------------

console.log("");
console.log("══════════════════════════════════════");
console.log(" ENGINEERING BRAIN MVP RESULT");
console.log("══════════════════════════════════════");
console.log("");

console.log(`Passed : ${passed}`);
console.log(`Failed : ${failed}`);

console.log("");

if (failed === 0) {

    console.log("✅ PASS");

    console.log("");

    console.log("Engineering Brain MVP Operational");

}

else {

    console.log("❌ FAIL");

    process.exit(1);

}

console.log("");
console.log("══════════════════════════════════════");