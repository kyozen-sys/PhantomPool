import { connect } from "puppeteer-real-browser";

import type {
  Options,
  PageWithCursor,
  ConnectResult,
} from "puppeteer-real-browser";

export class Browser {
  private static readonly args: string[] = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
  ];

  private connc!: ConnectResult;

  private busy: boolean = false;

  static async init(override?: Options) {
    const opt: Options = {
      headless: false,
      args: Browser.args,
    };

    const browser: Browser = new Browser();

    browser.connc = await connect({ ...opt, ...override });

    return browser;
  }

  public async reset(): Promise<void> {
    const page: PageWithCursor = this.connc.page;

    try {
      await page.goto("about:blank");

      await page.evaluate(() => {
        document.open();
        document.write("");
        document.close();
      });
    } catch {}
  }

  public getPage(): PageWithCursor {
    return this.connc.page;
  }

  public isBusy(): boolean {
    return this.busy;
  }

  public makeBusy(): void {
    this.busy = true;
  }

  public makeUnBusy(): void {
    this.busy = false;
  }
}
