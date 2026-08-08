import assert from "assert";

import {

    KnowledgeEngine,

    EvidenceEngine,

    RecommendationBuilder,

    ConfidenceEngine,

    EngineeringRecommendation,

    EvidencePackage

} from "./lib/engineering-brain/index.js";

console.log("");
console.log("══════════════════════════════════════");
console.log(" ENGINEERING BRAIN PUBLIC API TEST");
console.log("══════════════════════════════════════");
console.log("");

assert.ok(KnowledgeEngine);
assert.ok(EvidenceEngine);
assert.ok(RecommendationBuilder);
assert.ok(ConfidenceEngine);
assert.ok(EngineeringRecommendation);
assert.ok(EvidencePackage);

console.log("✅ Public API exports verified");

console.log("");
console.log("══════════════════════════════════════");
console.log(" PASS");
console.log("══════════════════════════════════════");