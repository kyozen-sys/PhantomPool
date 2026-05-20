import { Browser } from "./browser";

import { BrowserLease, type BrowserLeaseOnReleased } from "./lease";

export interface BrowserPoolConfig {
  size: number;
  leaseTimeoutMS: number;
}

export class BrowserPoolLeaseAbortedError extends Error {
  constructor() {
    super("Lease acquisition aborted");
  }
}

export class BrowserPool {
  private browsers: Browser[] = [];

  private waiters: Array<(b: Browser) => void> = [];

  constructor(private config: BrowserPoolConfig) {}

  public async init() {
    for (let i = 0; i < this.config.size; i++) {
      const browser: Browser = new Browser();

      await browser.init();

      this.browsers.push(browser);
    }
  }

  public async acquireLease(signal: AbortSignal): Promise<BrowserLease> {
    const controller: AbortController = new AbortController();

    if (signal.aborted) {
      controller.abort("Upstream aborted");

      throw new BrowserPoolLeaseAbortedError();
    }

    signal.addEventListener(
      "abort",
      () => controller.abort("Upstream aborted"),
      { once: true },
    );

    const free: Browser | undefined = this.browsers.find(b => !b.isBusy());

    const timeout: number = this.config.leaseTimeoutMS;

    const onReleased: BrowserLeaseOnReleased = async (b) => {
      const next = this.waiters.shift(); // handoff direto pro próximo waiter mantém `busy` — evita race com novos acquireLease

      if (next) next(b);
      else {
        b.makeUnBusy();
      }
    };

    if (free) {
      free.makeBusy();

      return new BrowserLease(controller, free, timeout, onReleased);
    }

    const { promise, resolve, reject } = Promise.withResolvers<Browser>();

    const onAbort = () => {
      const index = this.waiters.indexOf(resolve);

      if (index !== -1) this.waiters.splice(index, 1);

      reject(new BrowserPoolLeaseAbortedError());
    }

    controller.signal.addEventListener("abort", onAbort, { once: true });

    this.waiters.push(resolve);

    return promise.then((b) => {
      controller.signal.removeEventListener("abort", onAbort);

      return new BrowserLease(controller, b, timeout, onReleased)
    });
  }

  public getSize(): number {
    return this.config.size;
  }
}
