import type { PageWithCursor } from "puppeteer-real-browser";

import { Job, Queue } from "@/queue";

import type { BrowserLease } from "@/browser";

export interface NavigateResult {
  status: number;
  html: string;
  agent: string;
}

export class NavigateService {
  constructor(private readonly queue: Queue) {}

  async navigate(
    url: string,
    controller: AbortController,
  ): Promise<NavigateResult> {
    const executor = async (lease: BrowserLease): Promise<NavigateResult> => {
      const page: PageWithCursor = lease.getPage();

      const res = await page.goto(url, {
        signal: lease.signal,
        waitUntil: "domcontentloaded",
      });

      const status: number = res?.status() ?? -1;

      const agent: string = await page.evaluate(() => navigator.userAgent);

      const html: string = await page.content();

      return { status, agent, html };
    };

    const job = new Job<NavigateResult>(controller, executor);

    this.queue.enQueue(job);

    return job.promise;
  }
}
