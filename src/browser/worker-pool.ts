import type { Queue } from "@/queue";

import { BrowserWorker } from "./worker";

import type { BrowserPool } from "./pool";

export class BrowserWorkerPool {
  private workers: BrowserWorker[] = [];

  private readonly controller: AbortController = new AbortController();

  constructor(
    private readonly pool: BrowserPool,
    private readonly queue: Queue,
  ) {}

  public async init() {
    for (let i = 0; i < this.pool.getSize(); i++) {
      const worker: BrowserWorker = new BrowserWorker(
        this.pool,
        this.controller.signal,
      );

      this.workers.push(worker);

      (async () => {
        worker.init(this.queue);
      })();
    }
  }

  public stop(): void {
    this.controller.abort();
  }
}
