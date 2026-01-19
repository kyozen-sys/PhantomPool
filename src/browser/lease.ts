import { Browser } from "./browser";

import type { PageWithCursor } from "puppeteer-real-browser";

export type BrowserLeaseOnReleased = (
  browser: Browser,
  dirt: boolean,
) => Promise<void>;

export class BrowserLease {
  public readonly signal: AbortSignal;

  private released: boolean = false;

  constructor(
    private readonly browser: Browser,
    private readonly controller: AbortController,
    private readonly onReleased: BrowserLeaseOnReleased,
  ) {
    this.signal = controller.signal;
  }

  public async release(): Promise<void> {
    if (this.released) return;

    await this.onReleased?.(this.browser, false);

    this.released = true;
  }

  public async cancel(reason?: string): Promise<void> {
    if (this.released) return;

    this.controller.abort(reason);

    await this.onReleased?.(this.browser, true);

    this.released = true;
  }

  public acquirePage(): PageWithCursor {
    return this.browser.getPage();
  }
}
