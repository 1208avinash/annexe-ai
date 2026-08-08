import { spawn }           from "child_process";
import { validateCommand } from "./command-policy.js";



// ── OS command normalisation ──────────────────────────────────────────────────
//
// Windows exposes npm and npx as .cmd shims.
// spawn() with shell:false cannot resolve bare "npm" on Win32.
// Normalise the executable token before splitting so the rest of the
// runner is platform-agnostic.

function normalizeCommand(command) {

  if (process.platform !== "win32") return command;

  return command
    .replace(/^npm(\s|$)/, "npm.cmd$1")
    .replace(/^npx(\s|$)/, "npx.cmd$1");

}

/*
  ANNEXE EXECUTION ENGINE
  command-runner.js

  Purpose:
  Safe, structured command execution abstraction.

  Responsibility:
  Run a single shell command.
  Capture stdout, stderr, exit code, duration.
  Return a structured result object.

  Does NOT:
  - Retry on failure
  - Modify files
  - Install packages
  - Interpret business logic
  - Trigger workflows
*/


export async function runCommand({
  command,
  cwd = process.cwd(),
  timeout = 60000
} = {}) {


  // ── Policy check ─────────────────────────────────────────────────────────

  const policy = validateCommand(command);

  if (!policy.allowed) {
    return {
      success:  false,
      command,
      stdout:   "",
      stderr:   "",
      exitCode: null,
      duration: 0,
      error:    policy.reason
    };
  }


  // ── Existing validation ───────────────────────────────────────────────────

  if (!command || typeof command !== "string") {

    return {
      success: false,
      command: command ?? null,
      stdout: "",
      stderr: "",
      exitCode: null,
      duration: 0,
      error: "Invalid command — must be a non-empty string"
    };

  }


  const startedAt = new Date().toISOString();
  const startTime = Date.now();


  return new Promise((resolve) => {


    let stdout = "";
    let stderr = "";
    let timedOut = false;


    /*
      Split command string into executable + args.
      e.g. "npm run build" → ["npm", ["run", "build"]]
      On Windows, normalise npm/npx to their .cmd shims first.
    */

    const [executable, ...args] =
      normalizeCommand(command.trim()).split(/\s+/);


    let child;


    // ── Platform-aware spawn ─────────────────────────────────────────────────
    //
    // Linux/macOS: spawn executable directly with shell:false.
    // Windows:     .cmd files must be run through cmd.exe explicitly to avoid
    //              EINVAL (shell:false can't execute batch scripts) and
    //              DEP0190 (shell:true with args array is deprecated).

    const spawnArgs = process.platform === "win32" && executable.endsWith(".cmd")
      ? ["/c", executable, ...args]
      : args;

    const spawnExecutable = process.platform === "win32" && executable.endsWith(".cmd")
      ? "cmd.exe"
      : executable;

    try {

      child = spawn(spawnExecutable, spawnArgs, {
        cwd,
        shell: false,
        env: process.env
      });

    } catch (spawnError) {

      const finishedAt = new Date().toISOString();
      const duration = Date.now() - startTime;

      return resolve({
        success: false,
        command,
        stdout: "",
        stderr: "",
        exitCode: null,
        duration,
        startedAt,
        finishedAt,
        error: `Spawn failed: ${spawnError.message}`
      });

    }


    // Capture stdout
    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });


    // Capture stderr
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });


    // Timeout guard
    const timer = setTimeout(() => {

      timedOut = true;

      child.kill("SIGTERM");

    }, timeout);


    // Process exit
    child.on("close", (exitCode) => {

      clearTimeout(timer);

      const finishedAt = new Date().toISOString();
      const duration = Date.now() - startTime;


      if (timedOut) {

        return resolve({
          success: false,
          command,
          stdout,
          stderr,
          exitCode: exitCode ?? null,
          duration,
          startedAt,
          finishedAt,
          error: `Command timed out after ${timeout}ms`
        });

      }


      if (exitCode === 0) {

        return resolve({
          success: true,
          command,
          stdout,
          stderr,
          exitCode: 0,
          duration,
          startedAt,
          finishedAt
        });

      }


      return resolve({
        success: false,
        command,
        stdout,
        stderr,
        exitCode: exitCode ?? null,
        duration,
        startedAt,
        finishedAt,
        error: `Command exited with code ${exitCode}`
      });

    });


    // Spawn error (e.g. ENOENT)
    child.on("error", (err) => {

      clearTimeout(timer);

      const finishedAt = new Date().toISOString();
      const duration = Date.now() - startTime;

      return resolve({
        success: false,
        command,
        stdout,
        stderr,
        exitCode: null,
        duration,
        startedAt,
        finishedAt,
        error: err.message
      });

    });

  });

}


export default runCommand;
