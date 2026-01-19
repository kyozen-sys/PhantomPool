import { Browser } from "./browser";

import { BrowserLease, type BrowserLeaseOnReleased } from "./lease";

export interface BrowserPoolConfig {
  retryMS: number;
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

    while (true) {
      if (controller.signal.aborted) throw new BrowserPoolLeaseAbortedError();

      for (const browser of this.browsers) {
        if (browser.isBusy()) continue;

        browser.makeBusy();

        const onReleased: BrowserLeaseOnReleased = async (b, dirty) => {
          await b.reset(dirty);

          b.makeUnBusy();
        };

        const { leaseTimeoutMS: timeoutMS } = this.config;

        return new BrowserLease(controller, browser, timeoutMS, onReleased);
      }

      await Bun.sleep(this.config.retryMS);
    }
  }

  public getSize(): number {
    return this.config.size;
  }
}
