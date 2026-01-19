import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { getSchema } from "./navigate.schema";

import type { getSchemaOkRes, getSchemaQuery } from "./navigate.schema";

import type { NavigateResult, NavigateService } from "./navigate.service";

export class NavigateController {
  constructor(private service: NavigateService) {}

  getStatus = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<object> => {
    // TMP, MOCK
    return reply.send({
      status: "ok",
      browsers: { total: 0, busy: 0 },
    });
  };

  get = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<getSchemaOkRes> => {
    const { url, timeoutMS } = request.query as getSchemaQuery;

    const controller: AbortController = new AbortController();

    const timeout: NodeJS.Timeout = setTimeout(() => {
      controller.abort();
    }, timeoutMS);

    request.raw.on("close", () => {
      clearTimeout(timeout);

      controller.abort();
    });

    try {
      const result: NavigateResult = await this.service.navigate(
        url,
        controller,
      );

      return reply.send({
        header: {
          agent: result.agent,
          status: result.status,
        },
        html: result.html,
      });
    } catch (err) {
      if (!controller.signal.aborted) throw err;

      return reply.code(499).send({ error: String(err) });
    }
  };

  public plugin = async (app: FastifyInstance) => {
    app.get("/", getSchema, this.get);

    // app.get("/status", this.getStatus);
  };
}

export default { NavigateController };
