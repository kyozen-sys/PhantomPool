import type { FastifyInstance, FastifyPluginAsync } from "fastify";

import type { Queue } from "@/queue";

import { NavigateService } from "./navigate.service";

import { NavigateController } from "./navigate.controller";

export function navigateModule(browserQueue: Queue): FastifyPluginAsync {
  const service = new NavigateService(browserQueue);

  const controller = new NavigateController(service);

  return async (app: FastifyInstance) => app.register(async (scoped) => {
    await scoped.register(controller.plugin);
  }, {
    prefix: "/navigate"
  });
}