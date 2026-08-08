// ── ANNEXE AI — Backend Generation Pipeline Test ─────────────────────────────
//
// Verifies:
// Backend Plan
//      ↓
// Code Generator
//      ↓
// File Writer
//      ↓
// Sandbox
//      ↓
// Commit Manager
//
// ─────────────────────────────────────────────────────────────────────────────


import { sandboxManager } from "./lib/sandbox/manager.js";
import { writeGeneratedFiles } from "./lib/generation/file-writer.js";
import { runBackendCodeGenerator } from "./lib/generation/backend/generator.js";
import { CommitManager } from "./lib/repository/commit.js";



console.log(`
════════════════════════════════════════
 ANNEXE AI Backend Generation Pipeline
════════════════════════════════════════
`);



let passed = 0;
let failed = 0;


function check(name, condition){

    if(condition){
        console.log("✅", name);
        passed++;
    }
    else{
        console.log("❌", name);
        failed++;
    }

}



// ── Step 1: Backend Plan ─────────────────────────────────────────────────────


const backendPlan = {

    framework:"FastAPI",

    services:[
        "Auth Service",
        "CRM Service",
        "Lead Service"
    ],

    apis:[
        "GET /health",
        "POST /login",
        "GET /leads"
    ]

};



console.log("\n── Step 1 Backend Generator ─────────────");

const generated =
    runBackendCodeGenerator({
        backendPlan
    });


check(
    "generator success",
    generated.success === true
);


check(
    "files generated",
    generated.files.length === 5
);



// ── Step 2: Sandbox ──────────────────────────────────────────────────────────


console.log("\n── Step 2 Sandbox ───────────────────────");


const sandbox =
    sandboxManager.createSandbox(
        "BACKEND-PIPELINE-TEST"
    );


check(
    "sandbox created",
    !!sandbox.id
);



// ── Step 3: File Writer ──────────────────────────────────────────────────────


console.log("\n── Step 3 File Writer ───────────────────");


const writeResult =
    writeGeneratedFiles({

        sandboxId:sandbox.id,

        agent:"backend_coding_agent",

        files:generated.files

    });


check(
    "files written",
    writeResult.success === true
);


check(
    "all files count written",
    writeResult.filesWritten === 5
);



// ── Step 4: Commit ───────────────────────────────────────────────────────────


console.log("\n── Step 4 Commit ────────────────────────");


const commitManager =
    new CommitManager();



const commit =
    commitManager.createCommit({

        task:{
            id:"TASK-BACKEND-GEN-001",
            name:"Backend Generation",
            description:"generate backend application files"
        },

        files:generated.files.map(file=>({
            name:file.path
        })),

        type:"feat"

    });



check(
    "commit created",
    commit.success === true
);


check(
    "commit id exists",
    !!commit.commit?.id
);


check(
    "commit message exists",
    !!commit.commit?.message
);




// ── Summary ──────────────────────────────────────────────────────────────────


console.log(`
════════════════════════════════════════
 Backend Generation Pipeline
 ${passed} passed, ${failed} failed
════════════════════════════════════════
`);



if(failed > 0){
    process.exit(1);
}