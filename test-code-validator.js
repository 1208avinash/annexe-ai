import { runCodeValidatorAgent }
from "./lib/agents/code-validator/agent.js";


console.log(`
════════════════════════════════
 ANNEXE AI Code Validator Test
════════════════════════════════
`);


let passed = 0;
let failed = 0;


function check(name,value){

    if(value){

        console.log("✅",name);
        passed++;

    }else{

        console.log("❌",name);
        failed++;

    }

}



// Valid files

const valid =
runCodeValidatorAgent({

files:[

{
 path:"api/main.py",
 content:"print('hello')"
},

{
 path:"services/auth.py",
 content:"class AuthService: pass"
}

]

});


check(
"valid files succeed",
valid.success === true
);


check(
"all files passed",
valid.validation.passed === 2
);



// Invalid file

const invalid =
runCodeValidatorAgent({

files:[

{
 path:"api/delete.py",
 content:"DROP DATABASE users;"
}

]

});


check(
"dangerous code rejected",
invalid.success === false
);


check(
"issues detected",
invalid.issues.length > 0
);



// Empty input

const empty =
runCodeValidatorAgent();


check(
"missing files handled",
empty.success === true
);



console.log(`
════════════════════════════════
 ${passed} passed, ${failed} failed
════════════════════════════════
`);



if(failed>0){

process.exit(1);

}