import { Browser } from "./browser";

export interface BrowserPoolConfig {
  retryMS: number;
  maxInstances: number;
}

export class BrowserPoolAcquireAbortedError extends Error {
  constructor() {
    super("The browser acquisition operation was aborted");

    Object.setPrototypeOf(this, BrowserPoolAcquireAbortedError.prototype);
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

  public async acquire(signal?: AbortSignal): Promise<Browser> {
    while (true) {
      if (signal?.aborted) throw new BrowserPoolAcquireAbortedError();

      for (const browser of this.browsers) {
        if (browser.isBusy()) continue;

        browser.makeBusy();

        return browser;
      }

      await Bun.sleep(this.config.retryMS);
    }
  }

  public async release(browser: Browser): Promise<void> {
    await browser.reset();

    browser.makeUnBusy();
  }
}
