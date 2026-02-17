/**
 * Agent execute job: enqueue and run. Handler runs execute() from runner.
 * TODO: Real queue provider; worker pulls job and runs same handler.
 */

import type { ExecuteInput, ExecuteResult } from "../runner/types";
import { execute } from "../runner/runner";
import { inProcessQueue, runJobById } from "./in-process-queue";

const JOB_TYPE = "agent-execute";

let registered = false;
function ensureRegistered(): void {
  if (registered) return;
  inProcessQueue.process<ExecuteInput>(JOB_TYPE, async (payload) => {
    const result = execute(payload);
    return result as ExecuteResult;
  });
  registered = true;
}

/** Enqueue an execute job. Returns jobId. */
export async function enqueueExecute(input: ExecuteInput): Promise<string> {
  ensureRegistered();
  return inProcessQueue.enqueue(JOB_TYPE, input, { maxRetries: 2 });
}

/** Run the job immediately (in-process). Returns result with runId. */
export async function runExecuteJob(jobId: string): Promise<ExecuteResult> {
  const result = await runJobById(jobId);
  return result as ExecuteResult;
}
