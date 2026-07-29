// ── ANNEXE AI — Backend Code Generator ───────────────────────────────────────
//
// Converts backend engineering plans into generated file manifests.
//
// Input:
// {
//   framework,
//   services,
//   apis,
//   authentication,
//   securityTasks
// }
//
// Output:
// {
//   success:true,
//   files:[
//      { path, content }
//   ]
// }
//
// Generator → File Writer → Sandbox
//
// ─────────────────────────────────────────────────────────────────────────────


function generateMainFile(plan) {

  return {
    path: "api/main.py",

    content:
`# ANNEXE AI Generated Backend

# Framework: ${plan.framework || "unknown"}

def health_check():
    return {
        "status": "ok"
    }


def startup():
    print("ANNEXE AI backend started")
`
  };

}



function generateServices(plan) {

  const files = [];


  for (const service of plan.services || []) {

    const filename =
      service
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");


    files.push({

      path:`services/${filename}.py`,

      content:
`# ANNEXE AI Generated Service

# Service:
# ${service}


class ${filename}:

    def execute(self):
        return {
            "service": "${service}",
            "status": "ready"
        }
`

    });

  }


  return files;

}



function generateRoutes(plan) {

  return {

    path:"api/routes.py",

    content:
`# ANNEXE AI Generated API Routes


# Generated endpoints:

${(plan.apis || [])
.map(api => "# " + api)
.join("\n")}

`

  };

}



export function runBackendCodeGenerator({
  backendPlan = null
} = {}) {


  if (!backendPlan) {

    return {
      success:false,
      error:"backendPlan required"
    };

  }


  const files = [];


  files.push(
    generateMainFile(backendPlan)
  );


  files.push(
    ...generateServices(backendPlan)
  );


  files.push(
    generateRoutes(backendPlan)
  );



  return {

    success:true,

    agent:"backend_code_generator",

    framework:backendPlan.framework || null,

    files,

    fileCount:files.length,

    generatedAt:new Date().toISOString()

  };

}