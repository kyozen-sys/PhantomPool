import type { FastifyInstance } from "fastify";

import type { BrowserPool } from "@/browser";

import { NavigateService } from "./navigate.service";
import { NavigateController } from "./navigate.controller";

export class NavigateModule {
  private readonly prefix: string = "navigate";

  private service!: NavigateService;

  private controller!: NavigateController;

  constructor(browserPool: BrowserPool) {
    this.service = new NavigateService(browserPool);

    this.controller = new NavigateController(this.service);
  }

  public plugin = async (app: FastifyInstance) => {
    await app.register(this.controller.plugin, { prefix: this.prefix });
  };
}

export default { NavigateModule };
