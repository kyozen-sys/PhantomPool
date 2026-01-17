import Fastify, { type FastifyInstance } from "fastify";

import htmlRoutes from "./routes/html/html.routes";

const app: FastifyInstance = Fastify({ logger: true });

app.register(htmlRoutes);

await app.listen({ port: 4000 });
