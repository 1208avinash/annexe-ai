import assert from "assert";

import {
    KnowledgeEngine,
    EvidenceEngine,
    RecommendationBuilder,
    ConfidenceEngine
} from "./lib/engineering-brain/index.js";

import {
    DecisionEngine
} from "./lib/decision-engine/index.js";

import {
    MemoryManager,
    MemoryDomain
} from "./lib/engineering-memory/index.js";

console.log("");
console.log("════════════════════════════════════════════");
console.log("      ANNEXE AI CTO REGRESSION TEST");
console.log("════════════════════════════════════════════");
console.log("");

// -----------------------------------------------------------------
// Engineering Memory
// -----------------------------------------------------------------

const memory = new MemoryManager();

memory.createMemory({

    title: "CRM Architecture",

    description: "Reusable CRM architecture",

    domain: MemoryDomain.PATTERN,

    confidence: 0.95

});

memory.createMemory({

    title: "JWT Authentication",

    description: "Authentication module",

    domain: MemoryDomain.COMPONENT,

    confidence: 0.90

});

// -----------------------------------------------------------------
// Engines
// -----------------------------------------------------------------

const knowledgeEngine = new KnowledgeEngine(memory);

const evidenceEngine = new EvidenceEngine();

const recommendationBuilder = new RecommendationBuilder();

const confidenceEngine = new ConfidenceEngine();

const decisionEngine = new DecisionEngine();

// -----------------------------------------------------------------
// Requirement
// -----------------------------------------------------------------

const requirement = {

    projectId: "CRM-001",

    summary: "Build CRM for Logistics"

};

// -----------------------------------------------------------------
// Pipeline
// -----------------------------------------------------------------

const knowledge =
    knowledgeEngine.retrieveKnowledge("crm");

assert.ok(knowledge.records.length > 0);

const evidence =
    evidenceEngine.build(knowledge);

assert.ok(evidence.total > 0);

const recommendation =
    recommendationBuilder.build(

        requirement,

        knowledge,

        evidence

    );

const confidence =
    confidenceEngine.evaluate(

        recommendation,

        evidence

    );

recommendation.confidence =
    confidence.confidence;

const decision =
    decisionEngine.decide(

        recommendation

    );

assert.equal(decision.approved, true);

console.log("✅ Engineering Memory");

console.log("✅ Knowledge Engine");

console.log("✅ Evidence Engine");

console.log("✅ Recommendation Builder");

console.log("✅ Confidence Engine");

console.log("✅ Decision Engine");

console.log("");

console.log("🎉 AI CTO PIPELINE PASSED");

console.log("");

console.log("════════════════════════════════════════════");