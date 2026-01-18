import type { FastifyReply, FastifyRequest } from "fastify";

import type { GetHtmlQuery } from "./html.schemas";

export class HtmlController {
  public static async getHtml(request: FastifyRequest, reply: FastifyReply) {
    const { url, timeoutMS } = request.query as GetHtmlQuery;

    const controller: AbortController = new AbortController();

    const timeout: NodeJS.Timeout = setTimeout(() => {
      controller.abort();
    }, timeoutMS);

    request.raw.on("close", () => {
      clearTimeout(timeout);

      controller.abort();
    });

    try {
      const html: string = await request.server.htmlService.getHtml(
        url,
        controller.signal,
      );

      return reply.send({
        header: {
          agent: "",
          status: 200,
        },
        html: html,
      });
    } catch (err) {
      if (!controller.signal.aborted) throw err;

      return reply.code(499).send({ error: String(err) });
    }
  }
}
