// ── ANNEXE AI — Generation Pipeline ─────────────────────────────────────────
//
// Orchestrates:
// Plan → Generate → Validate → Write
//
// ─────────────────────────────────────────────────────────────────────────────


import { runBackendCodeGenerator } 
from "./backend/generator.js";

import { runCodeValidatorAgent }
from "../agents/code-validator/agent.js";

import { writeGeneratedFiles }
from "./file-writer.js";

import { sandboxManager }
from "../sandbox/manager.js";



export function runBackendGenerationPipeline({

    projectId,
    backendPlan

} = {}) {



    if(!backendPlan){

        return {

            success:false,

            error:"backendPlan required"

        };

    }



    // 1. Generate files

    const generated =
        runBackendCodeGenerator({
            backendPlan
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
            projectId || "GENERATION"
        );



    // 4. Write files

    const write =
        writeGeneratedFiles({

            sandboxId:sandbox.id,

            agent:"backend_coding_agent",

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