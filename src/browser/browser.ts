import { join } from "node:path";
import { mkdtempSync } from "node:fs";

import { connect } from "puppeteer-real-browser";

import type {
  Options,
  ConnectResult,
} from "puppeteer-real-browser";

export class Browser {
  private static readonly baseArgs: string[] = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
  ];

  private connc!: ConnectResult;

  private busy: boolean = false;

  async init(override?: Options) {
    const userDataDir = mkdtempSync(join("/tmp", "phantompool-"));

    const opt: Options = {
      headless: false,
      args: [...Browser.baseArgs, `--user-data-dir=${userDataDir}`],
    };

    this.connc = await connect({ ...opt, ...override });
  }

  public async getPage() {
    const ctx = await this.connc.browser.createBrowserContext();

    return ctx.newPage()
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
