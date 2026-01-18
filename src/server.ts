import Fastify, { type FastifyInstance } from "fastify";

import { BrowserPool } from "@/browser";

import { NavigateModule } from "@/modules/navigate/navigate.module";

const app: FastifyInstance = Fastify({ logger: true });

async function bootstrap(): Promise<void> {
  const browserPool: BrowserPool = new BrowserPool({
    maxInstances: 1,
    retryMS: 30_000,
  });

  await browserPool.init();

  const navigateModule: NavigateModule = new NavigateModule(browserPool);

  await app.register(navigateModule.plugin);

  await app.listen({ port: 4000 });
}

await bootstrap();
