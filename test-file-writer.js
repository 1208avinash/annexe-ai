import { sandboxManager } from "./api/sandbox/manager.js";
import { writeGeneratedFiles } from "./api/generation/file-writer.js";
import { fileOperationManager } from "./api/files/manager.js";


console.log(`
════════════════════════════════════
 ANNEXE AI File Writer Test
════════════════════════════════════
`);


const projectId = "FILE-WRITER-TEST";


// Create sandbox
const sandbox = sandboxManager.createSandbox(projectId);


console.log("Sandbox:", sandbox.id);


// Write files

const result = writeGeneratedFiles({

  sandboxId: sandbox.id,

  agent:"backend_coding_agent",

  files:[
    {
      path:"api/main.py",
      content:"print('ANNEXE AI generated backend')"
    },
    {
      path:"services/auth.py",
      content:"class AuthService: pass"
    }
  ]

});


console.log(result);


// Read verification

const files = fileOperationManager.listFiles({
  sandboxId:sandbox.id,
  agent:"test"
});


console.log("\nFiles:");
console.log(files);


if (
 result.success &&
 files.files.length === 2
) {

 console.log(`
════════════════════════════════════
 ✅ FILE WRITER TEST PASSED
════════════════════════════════════
 `);

} else {

 console.log(`
 ❌ FILE WRITER TEST FAILED
 `);

 process.exit(1);

}