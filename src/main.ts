import Fastify, { type FastifyInstance } from "fastify";

import { BrowserPool } from "./browser/pool";

import { HtmlRoutes } from "./routes/html/html.routes";
import { HtmlService } from "./routes/html/html.service";

const pool: BrowserPool = new BrowserPool({
  retryMS: 50,
  maxInstances: 5,
});

const app: FastifyInstance = Fastify({ logger: true });

async function bootstrap(): Promise<void> {
  await pool.init();

  const htmlService: HtmlService = new HtmlService(pool);

  app.decorate("htmlService", htmlService);

  app.register(HtmlRoutes.plugin);

  await app.listen({ port: 4000 });
}

await bootstrap();
