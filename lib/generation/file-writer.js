// ── ANNEXE AI — Generated File Writer ───────────────────────────────────────
//
// Converts generated file manifests into sandbox files.
//
// Generator output:
// [
//   {
//     path: "backend/app/main.py",
//     content: "...."
//   }
// ]
//
// Writer:
// Generator → FileOperationManager → Sandbox
//
// ─────────────────────────────────────────────────────────────────────────────

import { fileOperationManager } from "../files/manager.js";


export function writeGeneratedFiles({
  sandboxId,
  agent = "code_generator",
  files = []
} = {}) {

  if (!sandboxId) {
    return {
      success: false,
      error: "sandboxId required"
    };
  }


  if (!Array.isArray(files)) {
    return {
      success: false,
      error: "files must be array"
    };
  }


  const results = [];


  for (const file of files) {

    if (!file.path || !file.content) {
      results.push({
        success: false,
        path: file.path || null,
        error: "Invalid file object"
      });

      continue;
    }


    try {

      const result = fileOperationManager.createFile({
        operation: "CREATE",
        sandboxId,
        agent,
        filePath: file.path,
        content: file.content
      });


      results.push(result);

    } catch (error) {

      results.push({
        success:false,
        path:file.path,
        error:error.message
      });

    }

  }


  return {
    success: results.every(r => r.success),
    sandboxId,
    filesWritten: results.length,
    results
  };

}