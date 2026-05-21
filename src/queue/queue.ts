import type { Job } from "./job";

import type { ConfigEnv } from "@/config";

export type QueueConfig = ConfigEnv["queue"];

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

  private waiters: Array<(job: Job<unknown>) => void> = [];

  constructor(private readonly config: QueueConfig) {}

  public enQueue<T>(job: Job<T>): void {
    if (job.controller.signal.aborted) throw new QueueJobAbortedError();

    const next = this.waiters.shift();

    if (next) {
      next(job as Job<unknown>); return;
    }

    if (this.isFull()) throw new QueueFilledError();

    this.jobs.push(job as Job<unknown>);
  }

  public async waitDeQueue(signal?: AbortSignal): Promise<Job<unknown>> {
    if (signal?.aborted) throw new QueueJobAbortedError();

    while (this.jobs.length > 0) {
      const job: Job<unknown> = this.jobs.shift()!;

      if (!job.controller.signal.aborted) return job;
    }

    const { promise, resolve, reject } = Promise.withResolvers<Job<unknown>>();

    const sub = new AbortController();

    const onAbort = () => {
      const index = this.waiters.indexOf(resolve);

      if (index !== -1) this.waiters.splice(index, 1);

      reject(new QueueJobAbortedError());
    };

    signal?.addEventListener("abort", onAbort, { signal: sub.signal });

    this.waiters.push(resolve);

    return promise.then((job) => {
      sub.abort();

      if (job.controller.signal.aborted) return this.waitDeQueue(signal);

      return job;
    })
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
