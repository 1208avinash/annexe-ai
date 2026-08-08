// ── ANNEXE AI — Code Validator Agent ─────────────────────────────────────────
//
// Validates generated code before sandbox write.
//
// Checks:
// - file structure
// - empty content
// - dangerous patterns
// - basic syntax indicators
//
// ─────────────────────────────────────────────────────────────────────────────


const BLOCKED_PATTERNS = [

  "rm -rf",
  "drop database",
  "delete from users",
  "eval(",
  "exec("

];



function validateFile(file){

  const issues = [];


  if(!file.path){

    issues.push(
      "missing file path"
    );

  }


  if(
    !file.content ||
    typeof file.content !== "string"
  ){

    issues.push(
      "empty or invalid content"
    );

  }



  if(file.content){

    const lower =
      file.content.toLowerCase();


    for(const pattern of BLOCKED_PATTERNS){

      if(
        lower.includes(
          pattern.toLowerCase()
        )
      ){

        issues.push(
          `blocked pattern detected: ${pattern}`
        );

      }

    }

  }



  return {

    file:file.path || null,

    valid:issues.length === 0,

    issues

  };

}




export function runCodeValidatorAgent({

  files=[]

}={}){


  if(!Array.isArray(files)){

    return {

      success:false,

      error:"files must be array"

    };

  }



  const results =
    files.map(validateFile);



  const failed =
    results.filter(
      r=>!r.valid
    );



  return {

    success:
      failed.length === 0,

    agent:
      "code_validator_agent",

    validation:{

      totalFiles:
        files.length,

      passed:
        files.length - failed.length,

      failed:
        failed.length

    },

    results,

    issues:
      failed.flatMap(
        f=>f.issues
      ),

    validatedAt:
      new Date().toISOString()

  };

}