import type { Job } from "./job";

export interface QueueConfig {
  retryMS: number;
  maxJobs: number;
}

export class QueueJobAbortedError extends Error {
  constructor() {
    super("Queue Job aborted");
  }
}

export class QueueFilledError extends Error {
  constructor() {
    super("The queue has already reached its limit of jobs");
  }
}

export class Queue {
  private jobs: Job<unknown>[] = [];

  constructor(
    private readonly config: QueueConfig = { retryMS: 10, maxJobs: 20 },
  ) {}

  public enQueue<T>(job: Job<T>): void {
    if (this.isFull()) throw new QueueFilledError();

    this.jobs.push(job as Job<unknown>);
  }

  public async waitDeQueue(signal?: AbortSignal): Promise<Job<unknown>> {
    while (true) {
      if (signal?.aborted) throw new QueueJobAbortedError();

      const job: Job<unknown> = this.jobs.shift()!;

      if (!job) {
        await Bun.sleep(this.config.retryMS);
        continue;
      }

      if (job.controller.signal.aborted) continue;

      return job;
    }
  }

  public size(): number {
    return this.jobs.length;
  }

  public isFull(): boolean {
    return this.size() >= this.config.maxJobs;
  }

  public isEmpty(): boolean {
    return this.jobs.length === 0;
  }
}
