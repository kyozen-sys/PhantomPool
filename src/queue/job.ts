import { randomUUIDv7 } from "bun";

import type { BrowserLease } from "@/browser/lease";

export type JobExecutor<T> = (lease: BrowserLease) => Promise<T>;

export class Job<T> {
  public readonly id: string;

  public readonly promise: Promise<T>;

  private _resolve!: (result: T) => void;

  private _reject!: (err: Error) => void;

  constructor(
    public readonly controller: AbortController,
    public readonly executor: JobExecutor<T>,
  ) {
    this.id = randomUUIDv7();

    this.promise = new Promise<T>((resolve, reject) => {
      this._reject = reject;

      this._resolve = resolve;
    });
  }

  public resolve(result: T): void {
    this._resolve(result);
  }

  public reject(err: Error): void {
    this._reject(err);
  }
}
