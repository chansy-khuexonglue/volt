import { Job, JobHandler, JobOptions, QueueOptions } from './types';

export class JobQueue {
  private handlers = new Map<string, JobHandler>();
  private jobs = new Map<string, Job>();
  private queue: string[] = []; // queue of job IDs
  private activeWorkers = 0;
  private concurrency: number;
  private isRunning = false;

  private onCompletedListeners: Array<(job: Job) => void> = [];
  private onFailedListeners: Array<(job: Job, error: Error) => void> = [];

  constructor(options: QueueOptions = {}) {
    this.concurrency = options.concurrency || 3;
    if (options.autoStart ?? true) {
      this.start();
    }
  }

  define<TData = any, TResult = any>(
    name: string,
    handler: JobHandler<TData, TResult>
  ): this {
    this.handlers.set(name, handler);
    return this;
  }

  add<TData = any, TResult = any>(
    name: string,
    data: TData,
    options: JobOptions = {}
  ): Job<TData, TResult> {
    const id = `job_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    const job: Job<TData, TResult> = {
      id,
      name,
      data,
      status: 'pending',
      attemptsMade: 0,
      maxAttempts: options.attempts ?? 3,
      backoffDelayMs: options.backoffDelayMs ?? 100,
      createdAt: Date.now(),
    };

    this.jobs.set(id, job);
    this.queue.push(id);

    this.processNext();
    return job;
  }

  getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  start(): void {
    this.isRunning = true;
    this.processNext();
  }

  stop(): void {
    this.isRunning = false;
  }

  onCompleted(listener: (job: Job) => void): this {
    this.onCompletedListeners.push(listener);
    return this;
  }

  onFailed(listener: (job: Job, error: Error) => void): this {
    this.onFailedListeners.push(listener);
    return this;
  }

  async waitForJob<TResult = any>(id: string, timeoutMs = 5000): Promise<TResult> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const job = this.jobs.get(id);
      if (!job) throw new Error(`Job ${id} not found`);

      if (job.status === 'completed') {
        return job.result;
      }
      if (job.status === 'failed') {
        throw job.error || new Error(`Job ${id} failed`);
      }
      await new Promise((r) => setTimeout(r, 10));
    }
    throw new Error(`Timeout waiting for job ${id} to finish`);
  }

  private async processNext(): Promise<void> {
    if (!this.isRunning || this.activeWorkers >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const jobId = this.queue.shift();
    if (!jobId) return;

    const job = this.jobs.get(jobId);
    if (!job) return;

    const handler = this.handlers.get(job.name);
    if (!handler) {
      job.status = 'failed';
      job.error = new Error(`No handler registered for job type "${job.name}"`);
      this.onFailedListeners.forEach((fn) => fn(job, job.error!));
      this.processNext();
      return;
    }

    this.activeWorkers++;
    job.status = 'running';
    job.startedAt = Date.now();
    job.attemptsMade++;

    try {
      const result = await handler(job);
      job.status = 'completed';
      job.result = result;
      job.finishedAt = Date.now();
      this.onCompletedListeners.forEach((fn) => fn(job));
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(String(err));
      job.error = error;

      if (job.attemptsMade < job.maxAttempts) {
        // Schedule retry with backoff
        job.status = 'pending';
        setTimeout(() => {
          this.queue.push(job.id);
          this.processNext();
        }, job.backoffDelayMs * job.attemptsMade);
      } else {
        job.status = 'failed';
        job.finishedAt = Date.now();
        this.onFailedListeners.forEach((fn) => fn(job, error));
      }
    } finally {
      this.activeWorkers--;
      this.processNext();
    }
  }
}
