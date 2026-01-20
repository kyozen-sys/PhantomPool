import Fastify, { type FastifyInstance } from "fastify";

import { Config } from "@/config";

import { Queue } from "@/queue";

import { BrowserPool, BrowserWorkerPool } from "@/browser";

import { NavigateModule } from "@/navigate/navigate.module";

const app: FastifyInstance = Fastify({ logger: true });

async function bootstrap(): Promise<void> {
  const config: Config = new Config();

  const browserPool = new BrowserPool(config.browser.pool);

  await browserPool.init();

  const browserQueue = new Queue(config.queue);

  const workerPool = new BrowserWorkerPool(browserPool, browserQueue);

  await workerPool.init();

  const navigateModule = new NavigateModule(browserQueue);

  await app.register(navigateModule.plugin);

  await app.listen(config.server);
}

await bootstrap();
