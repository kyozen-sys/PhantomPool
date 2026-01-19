import Fastify, { type FastifyInstance } from "fastify";

import { Queue } from "@/queue";

import { BrowserPool, BrowserWorkerPool } from "@/browser";

import { NavigateModule } from "@/modules/navigate/navigate.module";

const app: FastifyInstance = Fastify({ logger: true });

async function bootstrap(): Promise<void> {
  const browserPool = new BrowserPool({ size: 1, retryMS: 1_000 });

  await browserPool.init();

  const browserQueue = new Queue();

  const workerPool = new BrowserWorkerPool(browserPool, browserQueue);

  await workerPool.init();

  const navigateModule = new NavigateModule(browserQueue);

  await app.register(navigateModule.plugin);

  await app.listen({ port: 4000, host: "0.0.0.0" });
}

await bootstrap();
