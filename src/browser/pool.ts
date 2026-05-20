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

export class BrowserPoolClosedError extends Error {
  constructor() {
    super("Pool is closed");
  }
}

export class BrowserPool {
  private working: boolean = true;

  private controller = new AbortController();

  private browsers = new Map<Browser, BrowserLease | null>();

  private waiters: ((b: Browser) => void)[] = [];

  constructor(private config: BrowserPoolConfig) {}

  public async init() {
    await Promise.all(Array.from({ length: this.config.size }, () => this.spawn()));
  }

  public async close(): Promise<void> {
    this.working = false;

    this.controller.abort("Pool is closing");

    await Promise.all(
      [...this.browsers.keys()].map((b) => b.close().catch(() => {})),
    );
  }

  private async spawn(): Promise<Browser> {
    while (this.working) {
      try { 
        const browser = new Browser();

        await browser.init();

        browser.setOnDead((dead) => this.handleDeath(dead));

        this.browsers.set(browser, null);

        const next = this.waiters.shift();

        if (next) next(browser);

        return browser;
      } catch {
        await Bun.sleep(1000);
      }
    }

    throw new BrowserPoolClosedError();
  }

  public async acquireLease(signal: AbortSignal): Promise<BrowserLease> {
    if (!this.working) throw new BrowserPoolClosedError();

    const controller = new AbortController();

    const sub = new AbortController();

    if (signal.aborted) {
      controller.abort("Upstream aborted");

      throw new BrowserPoolLeaseAbortedError();
    }

    signal.addEventListener(
      "abort",
      () => controller.abort("Upstream aborted"),
      { signal: sub.signal },
    );

    this.controller.signal.addEventListener(
      "abort",
      () => controller.abort("Pool is closing"),
      { signal: sub.signal },
    );

    const timeout: number = this.config.leaseTimeoutMS;

    const onReleased: BrowserLeaseOnReleased = async (b) => {
      sub.abort();

      const next = this.waiters.shift();
      
      if (next) next(b);
      else {
        this.browsers.set(b, null);
      }
    };

    for (const [b, lease] of this.browsers) {
      if (lease != null) continue;

      const freshLease = new BrowserLease(controller, b, timeout, onReleased);

      this.browsers.set(b, freshLease);

      return freshLease;
    }

    const { promise, resolve, reject } = Promise.withResolvers<Browser>();

    const onAbort = () => {
      sub.abort();
      
      const index = this.waiters.indexOf(resolve);

      if (index !== -1) this.waiters.splice(index, 1);

      reject(new BrowserPoolLeaseAbortedError());
    }

    controller.signal.addEventListener("abort", onAbort, { once: true });

    this.waiters.push(resolve);

    return promise.then((b) => {
      controller.signal.removeEventListener("abort", onAbort);

      const lease = new BrowserLease(controller, b, timeout, onReleased);

      this.browsers.set(b, lease);

      return lease
    });
  }

  public getCapacity(): number {
    return this.config.size;
  }

  private async handleDeath(dead: Browser) {
    if (!this.working) return;

    const lease = this.browsers.get(dead);

    this.browsers.delete(dead);

    if (lease) await lease.cancel("Browser died").catch(() => {});

    await this.spawn();
  }
}
