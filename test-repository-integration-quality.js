import {
    integrateGenerationResult
}
from "./lib/repository/integration.js";



function assert(condition, message){

    if(!condition){

        console.error("❌ FAIL:", message);

        process.exit(1);

    }

    console.log("✅ PASS:", message);

}




console.log(
"\n══════════════════════════════════════════"
);

console.log(
" ANNEXE AI — Repository Integration Quality Test"
);

console.log(
"══════════════════════════════════════════\n"
);





// TEST 1
// Failed generation must stop

const failedGeneration =
integrateGenerationResult({

    projectId:"test-project",

    task:{
        id:"task-001",
        name:"failed-build"
    },

    generationResult:{

        success:false

    }

});


assert(
    failedGeneration.success === false,
    "Reject failed generation"
);






// TEST 2
// Empty files must stop

const emptyFiles =
integrateGenerationResult({

    projectId:"test-project",

    task:{
        id:"task-002",
        name:"empty-build"
    },

    generationResult:{

        success:true,

        generatedFiles:[]

    }

});


assert(
    emptyFiles.success === false,
    "Reject empty generated files"
);







// TEST 3
// Valid generation creates repository package

const successResult =
integrateGenerationResult({

    projectId:"quality-project",

    task:{

        id:"task-003",

        name:"quality-test",

        description:
        "repository quality validation"

    },


    generationResult:{

        success:true,


        generatedFiles:[

            {
                path:"src/App.jsx",
                content:"export default App"
            }

        ],


        validation:{

            success:true

        }

    }

});



assert(
    successResult.success === true,
    "Create repository delivery package"
);


assert(
    successResult.repository.branch.includes(
        "annexe-ai"
    ),
    "Create ANNEXE AI feature branch"
);


assert(
    successResult.repository.commit.filesChanged.length === 1,
    "Commit contains generated files"
);


assert(
    successResult.repository.pullRequest.status ===
    "PENDING_REVIEW",
    "Create pending review PR"
);





console.log(
"\n══════════════════════════════════════════"
);

console.log(
" ALL REPOSITORY QUALITY TESTS PASSED"
);

console.log(
"══════════════════════════════════════════\n"
);