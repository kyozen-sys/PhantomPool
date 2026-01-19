import { Browser } from "./browser";

import { BrowserLease, type BrowserLeaseOnReleased } from "./lease";

export interface BrowserPoolConfig {
  retryMS: number;
  maxInstances: number;
}

export class BrowserPoolLeaseAborted extends Error {
  constructor() {
    super("Lease acquisition aborted");
  }
}

export class BrowserPool {
  private browsers: Browser[] = [];

  constructor(private config: BrowserPoolConfig) {}

  public async init() {
    for (let i = 0; i < this.config.maxInstances; i++) {
      const browser: Browser = new Browser();

      await browser.init();

      this.browsers.push(browser);
    }
  }

  public async acquireLease(
    controller: AbortController,
  ): Promise<BrowserLease> {
    while (true) {
      if (controller.signal.aborted) throw new BrowserPoolLeaseAborted();

      for (const browser of this.browsers) {
        if (browser.isBusy()) continue;

        browser.makeBusy();

        const onReleased: BrowserLeaseOnReleased = async (b, dirty) => {
          await b.reset(dirty);

          b.makeUnBusy();
        };

        const lease: BrowserLease = new BrowserLease(
          browser,
          controller,
          onReleased,
        );

        return lease;
      }

      await Bun.sleep(this.config.retryMS);
    }
  }
}
