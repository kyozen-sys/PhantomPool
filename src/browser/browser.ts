import { join } from "node:path";
import { mkdtempSync } from "node:fs";

import { connect } from "puppeteer-real-browser";

import type {
  Options,
  ConnectResult,
} from "puppeteer-real-browser";

export type BrowserContext = Awaited<ReturnType<Awaited<ReturnType<typeof connect>>["browser"]["createBrowserContext"]>>;

export type PageWithBrowserContext = Awaited<ReturnType<BrowserContext["newPage"]>>;

export type BrowserOnDead = (b: Browser) => void;

export class Browser {
  private static readonly baseArgs: string[] = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
  ];

  private connc!: ConnectResult;

  private context?: BrowserContext;

  private page?: PageWithBrowserContext;

  private leases: number = 0;

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
    if (this.page) return this.page;

    this.trackLease();

    this.context = await this.connc.browser.createBrowserContext();

    this.page = await this.context.newPage();

    return this.page;
  }

  public async recycle(): Promise<void> {
    await this.context?.close().catch(() => {});

    this.page = undefined;

    this.context = undefined;
  }

  public leaseCount(): number {
    return this.leases;
  }

  public setOnDead(callb: BrowserOnDead): void {
    this.onDead = callb;
  }

  public isDead(): boolean {
    return this.dead;
  }

  private trackLease(): void {
    this.leases++;
  }
}
