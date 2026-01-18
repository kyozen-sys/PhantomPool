import { Browser } from "./browser";

interface BrowserPoolConfig {
  retryMS: number;
  maxInstances: number;
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

  public async acquire(): Promise<Browser> {
    while (true) {
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
