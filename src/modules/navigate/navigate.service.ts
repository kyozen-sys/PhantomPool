import type { PageWithCursor } from "puppeteer-real-browser";

import type { BrowserLease, BrowserPool } from "@/browser";

export interface NavigateResult {
  status: number;
  html: string;
  agent: string;
}

export class NavigateService {
  constructor(private browserPool: BrowserPool) {}

  async navigate(
    url: string,
    controller: AbortController,
  ): Promise<NavigateResult> {
    const lease: BrowserLease = await this.browserPool.acquireLease(controller);

    try {
      const page: PageWithCursor = lease.acquirePage();

      const res = await page.goto(url, {
        signal: controller.signal,
        waitUntil: "domcontentloaded",
      });

      const status: number = res?.status() ?? -1;

      const agent: string = await page.evaluate(() => navigator.userAgent);

      const html: string = await page.content();

      return { html, status, agent };
    } finally {
      await lease.release();
    }
  }
}

export default { NavigateService };
