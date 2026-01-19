import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { getSchema } from "./navigate.schema";

import type { getSchemaOkRes, getSchemaQuery } from "./navigate.schema";

import type { NavigateResult, NavigateService } from "./navigate.service";

export class NavigateController {
  constructor(private service: NavigateService) {}

  get = async (
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<getSchemaOkRes> => {
    const { url, timeoutMS } = request.query as getSchemaQuery;

    const controller = new AbortController();

    const timeout = setTimeout(() => controller.abort(), timeoutMS);

    request.raw.on("close", () => controller.abort());

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
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        return reply.code(499).send({ error: "Request aborted" });
      }

      throw err;
    } finally {
      clearTimeout(timeout);
    }
  };

  public plugin = async (app: FastifyInstance) => {
    app.get("/", getSchema, this.get);
  };
}
