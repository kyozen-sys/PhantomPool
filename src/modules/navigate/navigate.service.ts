import type { PageWithCursor } from "puppeteer-real-browser";

import type { Browser, BrowserPool } from "@/browser";

export interface NavigateResult {
  status: number;
  html: string;
  agent: string;
}

export class NavigateService {
  constructor(private browserPool: BrowserPool) {}

  async navigate(url: string, signal: AbortSignal): Promise<NavigateResult> {
    const browser: Browser = await this.browserPool.acquire(signal);

    try {
      const page: PageWithCursor = browser.getPage();

      const res = await page.goto(url, {
        signal: signal,
        waitUntil: "domcontentloaded",
      });

      const status: number = res?.status() ?? -1;

      const agent: string = await page.evaluate(() => navigator.userAgent);

      const html: string = await page.content();

      return { html, status, agent };
    } finally {
      await this.browserPool.release(browser);
    }
  }
}

export default { NavigateService };
