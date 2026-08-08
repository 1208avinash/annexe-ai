// ── ANNEXE AI — Frontend Code Generator ──────────────────────────────────────
//
// Converts frontend engineering plans into generated file manifests.
//
// Frontend Plan
//      ↓
// File Manifest
//
// ─────────────────────────────────────────────────────────────────────────────



function componentName(value){

    if(typeof value !== "string"){

        value =
            value?.name ||
            value?.title ||
            value?.component ||
            "GeneratedComponent";

    }


    return String(value)
        .replace(/[^a-zA-Z0-9]/g," ")
        .split(" ")
        .filter(Boolean)
        .map(
            word =>
            word.charAt(0).toUpperCase()+word.slice(1)
        )
        .join("");

}




function generateAppFile(plan){

    return {

        path:"src/App.jsx",

        content:
`// ANNEXE AI Generated Frontend

// Framework:
 // ${plan.framework || "React"}


export default function App(){

    return (

        <div>

            <h1>
                ANNEXE AI Generated Application
            </h1>

        </div>

    );

}
`

    };

}




function generateComponents(plan){

    return (

        plan.components || []

    ).map(component=>{

        const name =
            componentName(component);


        return {

            path:`src/components/${name}.jsx`,

            content:
`// ANNEXE AI Generated Component

export default function ${name}(){

    return (

        <div>
            ${component}
        </div>

    );

}
`

        };

    });

}




function generatePages(plan){

    return (

        plan.pages || []

    ).map(page=>{

        const name =
            componentName(page);


        return {

            path:`src/pages/${name}.jsx`,

            content:
`// ANNEXE AI Generated Page

export default function ${name}(){

    return (

        <main>

            <h1>${page}</h1>

        </main>

    );

}
`

        };

    });

}





export function runFrontendCodeGenerator({

    frontendPlan=null

}={}){


    if(!frontendPlan){

        return {

            success:false,

            error:"frontendPlan required"

        };

    }



    const files=[];



    files.push(
        generateAppFile(frontendPlan)
    );


    files.push(
        ...generateComponents(frontendPlan)
    );


    files.push(
        ...generatePages(frontendPlan)
    );



    return {

        success:true,

        agent:"frontend_code_generator",

        framework:
            frontendPlan.framework || "React",

        files,

        fileCount:
            files.length,

        generatedAt:
            new Date().toISOString()

    };


}