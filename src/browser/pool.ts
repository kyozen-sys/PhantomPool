import { Browser } from "./browser";

export interface BrowserPoolConfig {
  retryMS: number;
  maxInstances: number;
}

export class BrowserAcquireAbortedError extends Error {
  constructor() {
    super("The browser acquisition operation was aborted");

    Object.setPrototypeOf(this, BrowserAcquireAbortedError.prototype);
  }
}

export class BrowserPool {
  private pool: Browser[] = [];

  constructor(private config: BrowserPoolConfig) {}

  public async init() {
    for (let i = 0; i < this.config.maxInstances; i++) {
      const browser: Browser = await Browser.init();

      this.pool.push(browser);
    }
  }

  public async acquire(signal?: AbortSignal): Promise<Browser> {
    while (true) {
      if (signal?.aborted) throw new BrowserAcquireAbortedError();

      const browser: Browser | null = await this.tryAcquire();

      if (browser) return browser;

      await Bun.sleep(this.config.retryMS);
    }
  }

  public async release(browser: Browser): Promise<void> {
    await browser.reset();

    browser.makeUnBusy();
  }

  private async tryAcquire(): Promise<Browser | null> {
    for (const browser of this.pool) {
      if (browser.isBusy()) continue;

      browser.makeBusy();

      return browser;
    }

    return null;
  }
}
