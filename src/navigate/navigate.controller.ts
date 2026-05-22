import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { QueueFilledError, QueueJobAbortedError } from "@/queue";

import { NavigateGetQuery, NavigateGetOkResponse, NavigateGetAbortedResponse, navigateGetAbortedResponse, NavigateGetQueueFilledResponse, navigateGetQeueueFilledResponse } from "./navigate.schema";

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
        return reply.code(499).send(navigateGetAbortedResponse);

      if (err instanceof QueueJobAbortedError)
        return reply.code(499).send(navigateGetAbortedResponse);

      if (err instanceof QueueFilledError)
        return reply.code(429).send(navigateGetQeueueFilledResponse);

      throw err;
    } finally {
      clearTimeout(timeout);
    }
  };

  public plugin = async (app: FastifyInstance) => {
    app.get("", {
      schema: {
        querystring: NavigateGetQuery,
        response: {
          200: NavigateGetOkResponse,
          429: NavigateGetQueueFilledResponse,
          499: NavigateGetAbortedResponse,
        },
        summary: "Navigate to a URL and retrieve the rendered HTML",
        description: "Acquires a browser lease, loads the page, returns its HTML content and releases the lease. Request can be aborted by the client or by a timeout.",
        tags: ["Navigate"],
      }
    }, this.get);
  };
}
