/**
 * Job queue abstraction. In-process now; swap to queue worker (SQS, Bull, etc.) later.
 */

export type JobStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "DLQ";

export interface Job<T = unknown> {
  id: string;
  type: string;
  payload: T;
  status: JobStatus;
  createdAt: string;
  runAt?: string;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  nextRetryAt?: string;
  result?: unknown;
}

export interface JobQueue {
  enqueue<T>(type: string, payload: T, opts?: { runAt?: string; maxRetries?: number }): Promise<string>;
  process<T>(jobType: string, handler: (payload: T) => Promise<unknown>): void;
  getJob(jobId: string): Job | undefined;
}

export interface DeadLetterEntry {
  id: string;
  jobId: string;
  jobType: string;
  payloadRedacted: string;
  lastError: string;
  retryCount: number;
  createdAt: string;
}
