export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface JobOptions {
  attempts?: number;
  backoffDelayMs?: number;
  priority?: number; // higher priority runs first
}

export interface Job<TData = any, TResult = any> {
  id: string;
  name: string;
  data: TData;
  result?: TResult;
  error?: Error;
  status: JobStatus;
  attemptsMade: number;
  maxAttempts: number;
  backoffDelayMs: number;
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
}

export type JobHandler<TData = any, TResult = any> = (
  job: Job<TData, TResult>
) => Promise<TResult> | TResult;

export interface QueueOptions {
  concurrency?: number;
  autoStart?: boolean;
}
