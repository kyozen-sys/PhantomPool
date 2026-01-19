import type { Job } from "./job";

export interface QueueConfig {
  retryMS: number;
}

export class QueueJobAbortedError extends Error {
  constructor() {
    super("Queue Job aborted");
  }
}

export class Queue {
  private jobs: Job<unknown>[] = [];

  constructor(private readonly config: QueueConfig = { retryMS: 10 }) {}

  public enQueue<T>(job: Job<T>): void {
    this.jobs.push(job as Job<unknown>);
  }

  public async waitDeQueue(signal?: AbortSignal): Promise<Job<unknown>> {
    while (!this.jobs.length) {
      if (signal?.aborted) throw new QueueJobAbortedError();

      await Bun.sleep(this.config.retryMS);
    }

    return this.jobs.shift()!;
  }

  public size(): number {
    return this.jobs.length;
  }

  public isEmpty(): boolean {
    return this.jobs.length === 0;
  }
}
