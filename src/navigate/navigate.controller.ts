import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { QueueFilledError, QueueJobAbortedError } from "@/queue";

import { NavigateGetOkResponse, NavigateGetQuery } from "./navigate.schema";

import type { NavigateResult, NavigateService } from "./navigate.service";

export class NavigateController {
  constructor(private service: NavigateService) {}

  get = async (
    request: FastifyRequest<{ Querystring: NavigateGetQuery }>,
    reply: FastifyReply,
  ): Promise<NavigateGetOkResponse> => {
    const { url, timeoutMS } = request.query;

    const controller = new AbortController();

    const timeout = setTimeout(() => controller.abort(), timeoutMS);

    request.raw.on("close", () => controller.abort());

    try {
      const result: NavigateResult = await this.service.navigate(url, controller);

      return reply.send({
        header: {
          agent: result.agent,
          status: result.status,
        },
        html: result.html,
      });
    } catch (err: unknown) {
      if (controller.signal.aborted)
        return reply.code(499).send({ error: "Request aborted" });

      if (err instanceof QueueJobAbortedError)
        return reply.code(499).send({ error: "Request aborted" });

      if (err instanceof QueueFilledError)
        return reply.code(429).send({ error: "Queue busy" });

      throw err;
    } finally {
      clearTimeout(timeout);
    }
  };

  public plugin = async (app: FastifyInstance) => {
    app.get("/", {
      schema: {
        querystring: NavigateGetQuery,
        response: { 200: NavigateGetOkResponse },
      }
    }, this.get);
  };
}
