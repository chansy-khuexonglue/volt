import { describe, expect, it } from 'bun:test';
import { JobQueue } from '../src/index';

describe('@volt/jobs', () => {
  it('defines, enqueues, and completes a background job', async () => {
    const queue = new JobQueue({ concurrency: 2 });

    queue.define<{ email: string; name: string }, { sent: boolean }>(
      'sendWelcomeEmail',
      async (job) => {
        expect(job.data.email).toBe('user@volt.sh');
        return { sent: true };
      }
    );

    const job = queue.add('sendWelcomeEmail', {
      email: 'user@volt.sh',
      name: 'Alice',
    });

    const result = await queue.waitForJob<{ sent: boolean }>(job.id);
    expect(result.sent).toBe(true);

    const completed = queue.getJob(job.id);
    expect(completed?.status).toBe('completed');
    expect(completed?.attemptsMade).toBe(1);
  });

  it('retries failed jobs up to maxAttempts', async () => {
    const queue = new JobQueue({ concurrency: 1 });
    let attempts = 0;

    queue.define('flakyTask', async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Temporary network glitch');
      }
      return 'success on attempt 3';
    });

    const job = queue.add('flakyTask', {}, { attempts: 3, backoffDelayMs: 20 });
    const result = await queue.waitForJob(job.id, 2000);

    expect(result).toBe('success on attempt 3');
    expect(attempts).toBe(3);
  });

  it('marks job as failed when all attempts are exhausted', async () => {
    const queue = new JobQueue({ concurrency: 1 });

    queue.define('alwaysFails', async () => {
      throw new Error('Permanent failure');
    });

    const job = queue.add('alwaysFails', {}, { attempts: 2, backoffDelayMs: 10 });

    expect(queue.waitForJob(job.id, 1000)).rejects.toThrow('Permanent failure');
  });
});
