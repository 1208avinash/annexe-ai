import assert from "assert";

import {

    DecisionEngine,

    GovernanceValidator,

    ArchitectureValidator,

    RiskAnalyzer,

    EngineeringDecision

} from "./api/decision-engine/index.js";

console.log("");
console.log("══════════════════════════════════════");
console.log(" DECISION ENGINE PUBLIC API TEST");
console.log("══════════════════════════════════════");
console.log("");

assert.ok(DecisionEngine);
assert.ok(GovernanceValidator);
assert.ok(ArchitectureValidator);
assert.ok(RiskAnalyzer);
assert.ok(EngineeringDecision);

console.log("✅ Public API exports verified");

console.log("");
console.log("══════════════════════════════════════");
console.log(" PASS");
console.log("══════════════════════════════════════");