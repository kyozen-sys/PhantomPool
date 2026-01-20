import type { Job, Queue } from "@/queue";

import type { BrowserLease } from "./lease";

import type { BrowserPool } from "./pool";

export class BrowserWorker {
  constructor(
    private readonly pool: BrowserPool,
    private readonly signal: AbortSignal,
  ) {}

  public async init(queue: Queue) {
    while (!this.signal.aborted) {
      const job: Job<unknown> = await queue.waitDeQueue(this.signal);

      await this.process(job);
    }
  }

  private async process(job: Job<unknown>): Promise<void> {
    let lease: BrowserLease | undefined;

    try {
      lease = await this.pool.acquireLease(this.signal);

      const result: unknown = await job.executor(lease);

      job.resolve(result);

      await lease.release();
    } catch (err: unknown) {
      if (err instanceof Error) job.reject(err);
      else {
        const e: Error = new Error(String(err));

        job.reject(e);
      }

      await lease?.cancel();
    }
  }
}
