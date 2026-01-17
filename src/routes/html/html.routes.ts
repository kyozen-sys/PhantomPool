import type { FastifyInstance } from "fastify";

import { getHtmlSchema } from "@/routes/html/html.schemas";

import { getHtmlController } from "./html.controller";

export default async function htmlRoutes(app: FastifyInstance) {
  app.get("/html", getHtmlSchema, getHtmlController);
}
