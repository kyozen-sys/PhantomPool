import { Browser } from "./browser";

export type BrowserLeaseOnReleased = ( browser: Browser ) => Promise<void>;

export class BrowserLeaseReuseError extends Error {
  constructor() {
    super("You cannot reuse the same lease.");
  }
}

export class BrowserLease {
  public readonly signal: AbortSignal;

  private released: boolean = false;

  private usable: boolean = true;

  private readonly cancelTimer: Timer;

  constructor(
    private readonly controller: AbortController,
    private readonly browser: Browser,
    private readonly lifeTimeMS: number,
    private readonly onReleased: BrowserLeaseOnReleased,
  ) {
    this.signal = controller.signal;

    this.cancelTimer = setTimeout(() => {
      this.cancel("Maximum lifespan reached");
    }, this.lifeTimeMS);
  }

  public async release(): Promise<void> {
    if (this.released) return;

    await this.onReleased?.(this.browser);

    this.discard();
  }

  public async cancel(reason?: string): Promise<void> {
    if (this.released) return;

    this.controller.abort(reason);

    await this.onReleased?.(this.browser);

    this.discard();
  }

  public async getPage() {
    if (!this.usable) throw new BrowserLeaseReuseError();

    return this.browser.getPage();
  }

  private discard() {
    clearTimeout(this.cancelTimer);

    this.usable = false;

    this.released = true;
  }
}
