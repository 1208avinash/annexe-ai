import { runBackendGenerationPipeline }
from "./api/generation/pipeline.js";


console.log(`
════════════════════════════════════
 ANNEXE AI Generation Orchestrator Test
════════════════════════════════════
`);


const result =
runBackendGenerationPipeline({

projectId:"PIPELINE-ORCHESTRATOR-001",

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


let passed=0;
let failed=0;


function check(name,value){

if(value){

console.log("✅",name);
passed++;

}else{

console.log("❌",name);
failed++;

}

}



check(
"pipeline success",
result.success===true
);


check(
"sandbox created",
!!result.sandboxId
);


check(
"validation passed",
result.validation.validation.failed===0
);


check(
"files written",
result.write.filesWritten===4
);



console.log(`
════════════════════════════════════
 ${passed} passed, ${failed} failed
════════════════════════════════════
`);



if(failed>0){
process.exit(1);
}