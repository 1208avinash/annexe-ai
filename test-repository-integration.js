import {
 integrateGenerationResult,
 getRepositoryState
}
from "./lib/repository/integration.js";



const result =
integrateGenerationResult({

    projectId:"demo-project",

    task:{
        id:"task-001",
        name:"create-dashboard",
        description:"generate dashboard UI"
    },


    generationResult:{

        success:true,

        generatedFiles:[

            {
                path:"src/App.jsx",
                content:"export default App"
            },

            {
                path:"src/api.js",
                content:"api client"
            }

        ],


        validation:{
            success:true
        }

    }

});



console.log(
JSON.stringify(result,null,2)
);



console.log(
JSON.stringify(
getRepositoryState(),
null,
2
)
);