import type { FastifyInstance } from "fastify";

import type { Queue } from "@/queue";

import { NavigateService } from "./navigate.service";

import { NavigateController } from "./navigate.controller";

export class NavigateModule {
  private readonly prefix: string = "navigate";

  private service: NavigateService;

  private controller: NavigateController;

  constructor(browserQueue: Queue) {
    this.service = new NavigateService(browserQueue);

    this.controller = new NavigateController(this.service);
  }

  public plugin = async (app: FastifyInstance) => {
    await app.register(this.controller.plugin, { prefix: this.prefix });
  };
}
