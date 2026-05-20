import { join } from "node:path";
import { mkdtempSync } from "node:fs";

import { connect } from "puppeteer-real-browser";

import type {
  Options,
  ConnectResult,
} from "puppeteer-real-browser";

export type BrowserOnDead = (b: Browser) => void;

export class Browser {
  private static readonly baseArgs: string[] = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
  ];

  private connc!: ConnectResult;

  private dead: boolean = false;

  private onDead?: BrowserOnDead;

  async init(override?: Options) {
    const userDataDir = mkdtempSync(join("/tmp", "phantompool-"));

    const opt: Options = {
      headless: false,
      args: [...Browser.baseArgs, `--user-data-dir=${userDataDir}`],
    };

    this.connc = await connect({ ...opt, ...override });

    this.connc.browser.on("disconnected", () => {
      if (this.dead) return;
      else {
        this.dead = true;
      }

      this.onDead?.(this);
    });
  }

  public async close(): Promise<void> {
    this.dead = true;

    await this.connc.browser.close().catch(() => {});
  }

  public async getPage() {
    const ctx = await this.connc.browser.createBrowserContext();

    return ctx.newPage()
  }

  public setOnDead(callb: BrowserOnDead): void {
    this.onDead = callb;
  }

  public isDead(): boolean {
    return this.dead;
  }
}
