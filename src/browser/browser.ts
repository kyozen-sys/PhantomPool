import { join } from "node:path";

import { mkdtemp, rm } from "node:fs/promises";

import { connect } from "puppeteer-real-browser";

import type {
  Options,
  ConnectResult,
} from "puppeteer-real-browser";

export type BrowserContext = Awaited<ReturnType<Awaited<ReturnType<typeof connect>>["browser"]["createBrowserContext"]>>;

export type PageWithBrowserContext = Awaited<ReturnType<BrowserContext["newPage"]>>;

export type BrowserOnDead = (b: Browser) => Promise<void>;

export class Browser {
  private static readonly baseArgs: string[] = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
  ];

  private connc!: ConnectResult;

  private context?: BrowserContext;

  private page?: PageWithBrowserContext;

  private userDataDir!: string;

  private leases: number = 0;

  private dead: boolean = false;

  private onDead: BrowserOnDead = async () => this.cleanup();

  async init(override?: Options) {
    this.userDataDir = await mkdtemp(join("/tmp", "phantompool-"));

    const opt: Options = {
      headless: false,
      args: [...Browser.baseArgs, `--user-data-dir=${this.userDataDir}`],
    };

    this.connc = await connect({ ...opt, ...override });

    this.connc.browser.on("disconnected", () => this.onDead(this));
  }

  public async close(): Promise<void> {
    await this.connc.browser.close().catch(() => this.onDead(this));
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
    const wrapper = async (b: Browser) => {
      await this.cleanup();

      await callb(b);
    };

    this.onDead = wrapper;
  }

  public isDead(): boolean {
    return this.dead;
  }

  private trackLease(): void {
    this.leases++;
  }

  private async cleanup(): Promise<void> {
    if (this.dead) return;
    else {
      this.dead = true;
    }

    await rm(this.userDataDir, { recursive: true, force: true }).catch(() => {});
  }
}
