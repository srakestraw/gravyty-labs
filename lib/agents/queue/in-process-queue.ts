/**
 * In-process job queue. Runs handlers synchronously when process() is invoked.
 * TODO: Replace with real queue (SQS, Bull, etc.) and worker process.
 */

import type { Job, JobQueue, DeadLetterEntry } from "./types";

const now = () => new Date().toISOString();
const id = () => `job-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const jobs = new Map<string, Job>();
const dlq: DeadLetterEntry[] = [];
const handlers = new Map<string, (payload: unknown) => Promise<unknown>>();

/** Per-agent execution lock: agentId -> jobId currently running. */
const agentLocks = new Map<string, string>();

/** Per-workspace concurrent job count. */
const workspaceRunningCount = new Map<string, number>();
let maxConcurrentPerWorkspace = 10;

export function setMaxConcurrentPerWorkspace(max: number): void {
  maxConcurrentPerWorkspace = max;
}

export function getAgentLock(agentId: string): string | undefined {
  return agentLocks.get(agentId);
}

export function setAgentLock(agentId: string, jobId: string): void {
  agentLocks.set(agentId, jobId);
}

export function clearAgentLock(agentId: string): void {
  agentLocks.delete(agentId);
}

export function getWorkspaceRunningCount(workspaceId: string): number {
  return workspaceRunningCount.get(workspaceId) ?? 0;
}

function incWorkspaceRunning(workspaceId: string): void {
  workspaceRunningCount.set(workspaceId, (workspaceRunningCount.get(workspaceId) ?? 0) + 1);
}

function decWorkspaceRunning(workspaceId: string): void {
  const n = (workspaceRunningCount.get(workspaceId) ?? 1) - 1;
  if (n <= 0) workspaceRunningCount.delete(workspaceId);
  else workspaceRunningCount.set(workspaceId, n);
}

export const inProcessQueue: JobQueue = {
  async enqueue<T>(type: string, payload: T, opts?: { runAt?: string; maxRetries?: number }): Promise<string> {
    const jobId = id();
    const job: Job<T> = {
      id: jobId,
      type,
      payload,
      status: "PENDING",
      createdAt: now(),
      runAt: opts?.runAt,
      retryCount: 0,
      maxRetries: opts?.maxRetries ?? 3,
    };
    jobs.set(jobId, job as Job);
    return jobId;
  },

  process<T>(jobType: string, handler: (payload: T) => Promise<unknown>): void {
    handlers.set(jobType, handler as (payload: unknown) => Promise<unknown>);
  },

  getJob(jobId: string): Job | undefined {
    return jobs.get(jobId);
  },
};

/** Process one pending job of type. Returns true if a job was processed. */
export async function processNextJob(jobType: string): Promise<boolean> {
  const handler = handlers.get(jobType);
  if (!handler) return false;
  const runAt = now();
  const job = Array.from(jobs.values()).find(
    (j) => j.type === jobType && j.status === "PENDING" && (!j.runAt || j.runAt <= runAt)
  );
  if (!job) return false;

  job.status = "RUNNING";
  try {
    const result = await handler(job.payload);
    job.status = "COMPLETED";
    job.result = result;
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    job.lastError = message;
    job.retryCount += 1;
    if (job.retryCount > job.maxRetries) {
      job.status = "FAILED";
      dlq.push({
        id: `dlq-${job.id}`,
        jobId: job.id,
        jobType: job.type,
        payloadRedacted: JSON.stringify({ type: job.type, id: job.id }),
        lastError: message,
        retryCount: job.retryCount,
        createdAt: now(),
      });
    } else {
      job.status = "PENDING";
      const backoff = Math.min(60 * 1000 * Math.pow(2, job.retryCount), 600 * 1000);
      job.nextRetryAt = new Date(Date.now() + backoff).toISOString();
    }
    return true;
  }
}

/** Run a single job by id. Used by execute route to run immediately after enqueue. */
export async function runJobById(jobId: string): Promise<unknown> {
  const job = jobs.get(jobId);
  if (!job || job.status !== "PENDING") return undefined;
  const handler = handlers.get(job.type);
  if (!handler) return undefined;

  const payload = job.payload as { workspaceId?: string; agentId?: string };
  const workspaceId = payload?.workspaceId ?? "";
  const agentId = payload?.agentId ?? "";
  if (getAgentLock(agentId)) throw new Error("Agent run already in progress");
  if (getWorkspaceRunningCount(workspaceId) >= maxConcurrentPerWorkspace) throw new Error("Workspace concurrent job limit reached");

  setAgentLock(agentId, job.id);
  incWorkspaceRunning(workspaceId);
  job.status = "RUNNING";
  try {
    const result = await handler(job.payload);
    job.status = "COMPLETED";
    job.result = result;
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    job.lastError = message;
    job.retryCount += 1;
    if (job.retryCount > job.maxRetries) {
      job.status = "FAILED";
      dlq.push({
        id: `dlq-${job.id}`,
        jobId: job.id,
        jobType: job.type,
        payloadRedacted: JSON.stringify({ type: job.type, agentId }),
        lastError: message,
        retryCount: job.retryCount,
        createdAt: now(),
      });
    } else {
      job.status = "PENDING";
      const backoff = Math.min(60 * 1000 * Math.pow(2, job.retryCount), 600 * 1000);
      (job as Job & { nextRetryAt?: string }).nextRetryAt = new Date(Date.now() + backoff).toISOString();
    }
    throw err;
  } finally {
    clearAgentLock(agentId);
    decWorkspaceRunning(workspaceId);
  }
}

export function listDLQ(): DeadLetterEntry[] {
  return [...dlq];
}

export function getJob(jobId: string): Job | undefined {
  return jobs.get(jobId);
}
