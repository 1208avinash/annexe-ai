import { runFrontendGenerationPipeline }
from "./lib/generation/frontend/pipeline.js";



console.log(`
════════════════════════════════════════
 ANNEXE AI Frontend Generation Pipeline
════════════════════════════════════════
`);



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




const result =
runFrontendGenerationPipeline({

projectId:"FRONTEND-PIPELINE-001",

frontendPlan:{

framework:"React",

components:[

"Login Form",

"Dashboard Card"

],

pages:[

"Dashboard",

"CRM Customers"

]

}

});




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
result.write.filesWritten===5
);



console.log(`
════════════════════════════════════════
 ${passed} passed, ${failed} failed
════════════════════════════════════════
`);



if(failed>0){

process.exit(1);

}