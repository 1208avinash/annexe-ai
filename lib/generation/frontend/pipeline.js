// ── ANNEXE AI — Frontend Generation Pipeline ─────────────────────────────────
//
// Frontend Plan
//      ↓
// Generator
//      ↓
// Validator
//      ↓
// Sandbox
//      ↓
// File Writer
//
// ─────────────────────────────────────────────────────────────────────────────


import { runFrontendCodeGenerator }
from "./generator.js";


import { runCodeValidatorAgent }
from "../../agents/code-validator/agent.js";


import { writeGeneratedFiles }
from "../file-writer.js";


import { sandboxManager }
from "../../sandbox/manager.js";





export function runFrontendGenerationPipeline({

    projectId,
    frontendPlan

} = {}) {



    if(!frontendPlan){

        return {

            success:false,

            error:"frontendPlan required"

        };

    }



    // 1. Generate frontend files

    const generated =
        runFrontendCodeGenerator({

            frontendPlan

        });



    if(!generated.success){

        return generated;

    }




    // 2. Validate generated code

    const validation =
        runCodeValidatorAgent({

            files: generated.files

        });



    if(!validation.success){

        return {

            success:false,

            stage:"validation",

            validation

        };

    }




    // 3. Create sandbox

    const sandbox =
        sandboxManager.createSandbox(

            projectId || "FRONTEND-GENERATION"

        );




    // 4. Write files

    const write =
        writeGeneratedFiles({

            sandboxId:sandbox.id,

            agent:"frontend_coding_agent",

            files:generated.files

        });



    return {

        success:write.success,

        sandboxId:sandbox.id,

        generatedFiles:generated.files,

        validation,

        write

    };


}