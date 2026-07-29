import { runFrontendCodeGenerator }
from "./api/generation/frontend/generator.js";



console.log(`
════════════════════════════════
 ANNEXE AI Frontend Code Generator
════════════════════════════════
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
runFrontendCodeGenerator({

frontendPlan:{

framework:"Next.js",

components:[
"Login Form",
"Dashboard Card",
"Lead Pipeline Board"
],

pages:[
"Dashboard",
"CRM Customers"
]

}

});



check(
"generator success",
result.success===true
);



check(
"files generated",
result.files.length===6
);



check(
"App generated",
result.files.some(
f=>f.path==="src/App.jsx"
)
);



check(
"components generated",
result.files.some(
f=>f.path.includes("components")
)
);



check(
"pages generated",
result.files.some(
f=>f.path.includes("pages")
)
);



console.log(`
════════════════════════════════
 ${passed} passed, ${failed} failed
════════════════════════════════
`);



if(failed>0){

process.exit(1);

}