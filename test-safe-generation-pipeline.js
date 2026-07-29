// ── ANNEXE AI — Safe Generation Pipeline Test ───────────────────────────────
//
// Flow:
//
// Backend Generator
//        ↓
// Code Validator
//        ↓
// File Writer
//        ↓
// Sandbox
//
// Ensures unsafe code never reaches storage.
//
// ─────────────────────────────────────────────────────────────────────────────


import { sandboxManager } from "./api/sandbox/manager.js";
import { writeGeneratedFiles } from "./api/generation/file-writer.js";
import { runBackendCodeGenerator } from "./api/generation/backend/generator.js";
import { runCodeValidatorAgent } from "./api/agents/code-validator/agent.js";



console.log(`
════════════════════════════════════
 ANNEXE AI Safe Generation Pipeline
════════════════════════════════════
`);



let passed = 0;
let failed = 0;


function check(name, value){

    if(value){

        console.log("✅", name);
        passed++;

    } else {

        console.log("❌", name);
        failed++;

    }

}



// ───────────────────────────────────
// 1. Generate code
// ───────────────────────────────────


console.log("\n── Step 1 Code Generation ─────────");


const generated =
runBackendCodeGenerator({

backendPlan:{

framework:"FastAPI",

services:[
"Auth Service",
"CRM Service"
],

apis:[
"GET /health"
]

}

});


check(
"generator succeeds",
generated.success === true
);


check(
"files created",
generated.files.length > 0
);



// ───────────────────────────────────
// 2. Validate code
// ───────────────────────────────────


console.log("\n── Step 2 Code Validation ─────────");


const validation =
runCodeValidatorAgent({

files:generated.files

});


check(
"validator succeeds",
validation.success === true
);


check(
"all generated files pass",
validation.validation.failed === 0
);



// ───────────────────────────────────
// 3. Write to sandbox
// ───────────────────────────────────


console.log("\n── Step 3 Sandbox Write ───────────");


const sandbox =
sandboxManager.createSandbox(
"SAFE-GENERATION-TEST"
);



const write =
writeGeneratedFiles({

sandboxId:sandbox.id,

agent:"backend_coding_agent",

files:generated.files

});



check(
"write succeeds after validation",
write.success === true
);


check(
"files written count matches",
write.filesWritten === generated.files.length
);



// ───────────────────────────────────
// 4. Unsafe code rejection
// ───────────────────────────────────


console.log("\n── Step 4 Unsafe Code Block ───────");


const unsafe =
runCodeValidatorAgent({

files:[

{
path:"api/bad.py",

content:"DROP DATABASE users;"

}

]

});



check(
"unsafe code rejected",
unsafe.success === false
);


check(
"validator reports issue",
unsafe.issues.length > 0
);



// ───────────────────────────────────
// Summary
// ───────────────────────────────────


console.log(`
════════════════════════════════════
 Safe Generation Pipeline
 ${passed} passed, ${failed} failed
════════════════════════════════════
`);



if(failed > 0){

process.exit(1);

}