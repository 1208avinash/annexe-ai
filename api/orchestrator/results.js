/*
  ANNEXE AI — Agent Execution Pipeline
  FILE: api/orchestrator/results.js

  ResultManager
  Stores and retrieves agent execution results.
  In-memory only. No external dependencies.
*/


/*
  In-memory result store
*/

const resultStore = []; // [{ id, taskId, agent, status, result|error, createdAt }]


/*
  generateResultId()
*/

function generateResultId() {
  return "RES-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}


/*
  ResultManager

  Handles storage of both successful and failed agent results.
*/

export class ResultManager {


  /*
    handleSuccess(result)

    Stores a successful execution result.

    result input:
    {
      taskId: string,
      agent:  string,
      result: object
    }

    Returns the stored record.
  */

  handleSuccess(result) {

    const record = {
      id:        generateResultId(),
      taskId:    result.taskId || null,
      agent:     result.agent  || null,
      status:    "COMPLETED",
      result:    result.result || {},
      createdAt: new Date().toISOString()
    };

    resultStore.push(record);

    console.log(
      "ANNEXE RESULT MANAGER — Success stored:",
      record.id,
      record.agent
    );

    return record;

  }


  /*
    handleFailure(result)

    Stores a failed execution result.

    result input:
    {
      taskId: string,
      agent:  string,
      error:  string
    }

    Returns the stored record.
  */

  handleFailure(result) {

    const record = {
      id:        generateResultId(),
      taskId:    result.taskId || null,
      agent:     result.agent  || null,
      status:    "FAILED",
      error:     result.error  || "Unknown error",
      createdAt: new Date().toISOString()
    };

    resultStore.push(record);

    console.log(
      "ANNEXE RESULT MANAGER — Failure stored:",
      record.id,
      record.agent,
      record.error
    );

    return record;

  }


  /*
    getResults(taskId?)

    Returns all stored results, optionally filtered by taskId.
  */

  getResults(taskId) {

    if (taskId) {
      return resultStore.filter(r => r.taskId === taskId);
    }

    return resultStore;

  }

}
