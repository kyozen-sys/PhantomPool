import Fastify, { type FastifyInstance } from "fastify";

import { Config } from "@/config";

import { Queue } from "@/queue";

import { BrowserPool, BrowserWorkerPool } from "@/browser";

import { NavigateModule } from "@/navigate/navigate.module";

const app: FastifyInstance = Fastify({ logger: true });

const config: Config = new Config();

const browserPool = new BrowserPool(config.browser.pool);

const browserQueue = new Queue(config.queue);

const workerPool = new BrowserWorkerPool(browserPool, browserQueue);

const navigateModule = new NavigateModule(browserQueue);

async function shutdown(): Promise<void> {
  let state: boolean = false;

  const handle = async (signal: string): Promise<void> => {
    if (state) return;
    else {
      state = true;
    }
    
    app.log.info(`${signal} received, closing server...`);

    const brute = setTimeout(() => {
      app.log.warn("Forcing shutdown...");

      process.exit(1);
    }, 8_000);

    brute.unref();

    try {
      await app.close();

      workerPool.close();

      await browserPool.close();
    } catch (error: unknown) { app.log.error({ error }, "Error during shutdown"); } finally {
      clearTimeout(brute);

      app.log.info("Shutdown complete.");

      process.exit(0);
    }
  }

  process.on("SIGINT", handle);
    
  process.on("SIGTERM", handle);
}

async function bootstrap(): Promise<void> {
  await browserPool.init();

  await workerPool.init();

  await app.register(navigateModule.plugin);

  await app.listen(config.server);

  await shutdown();
}

await bootstrap();
