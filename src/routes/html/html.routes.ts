import type { FastifyInstance } from "fastify";

import { getHtmlSchema } from "@/routes/html/html.schemas";

import { HtmlController } from "./html.controller";

export class HtmlRoutes {
  static async plugin(app: FastifyInstance) {
    app.get("/html", getHtmlSchema, HtmlController.getHtml);
  }
}
