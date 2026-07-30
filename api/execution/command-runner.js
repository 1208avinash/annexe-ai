import { spawn } from "child_process";


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
    */

    const [executable, ...args] =
      command.trim().split(/\s+/);


    let child;


    try {

      child = spawn(executable, args, {
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
