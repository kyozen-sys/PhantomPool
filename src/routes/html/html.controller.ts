import type { FastifyReply, FastifyRequest } from "fastify";

import type { GetHtmlQuery } from "./html.schemas";

export class HtmlController {
  public static async getHtml(request: FastifyRequest, reply: FastifyReply) {
    const { url } = request.query as GetHtmlQuery;

    const html: string = await request.server.htmlService.getHtml(url, 60_000);

    return reply.send({ html });
  }
}
