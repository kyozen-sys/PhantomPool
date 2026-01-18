import type { PageWithCursor } from "puppeteer-real-browser";

import type { Browser } from "@/browser/browser";

import type { BrowserPool } from "@/browser/pool";

export class HtmlService {
  constructor(private readonly pool: BrowserPool) {}

  async getHtml(url: string, timeout: number): Promise<string> {
    const browser: Browser = await this.pool.acquire();

    try {
      const page: PageWithCursor = browser.getPage();

      await page.goto(url, { waitUntil: "domcontentloaded", timeout });

      return await page.content();
    } finally {
      await this.pool.release(browser);
    }
  }
}
