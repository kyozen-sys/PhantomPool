import { HtmlService } from "@/routes/html/html.service";

declare module "fastify" {
  interface FastifyInstance {
    htmlService: HtmlService;
  }
}
