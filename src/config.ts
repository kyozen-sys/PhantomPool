import type { FastifyDynamicSwaggerOptions as SwaggerOptions } from "@fastify/swagger"

import type { FastifyApiReferenceOptions as ScalarOptions } from "@scalar/fastify-api-reference"

import pkg from "../package.json";

export interface ConfigEnv {
  server: {
    host: string;
    port: number;
  };
  browser: {
    pool: {
      size: number;
      maxLeasesPerBrowser: number;
      leaseTimeoutMS: number;
    };
  };
  queue: {
    maxJobs: number;
  };
  docs: {
    scalar: ScalarOptions;
    swagger: SwaggerOptions;
  }
}

export class ConfigInvalidEnvError extends Error {
  constructor(envKey: string) {
    super(`Invalid env ${envKey}`);
  }
}

export class Config {
  public readonly server: ConfigEnv["server"] = {
    host: this.loadEnv("HOST", "0.0.0.0"),
    port: this.loadEnv("PORT", 4000),
  };

  public readonly browser: ConfigEnv["browser"] = {
    pool: {
      size: this.loadEnv("BROWSER_POOL_SIZE", 2),
      maxLeasesPerBrowser: this.loadEnv("BROWSER_LEASE_PERBROWSER", 10),
      leaseTimeoutMS: this.loadEnv("BROWSER_LEASE_TIMEOUTMS", 60_000),
    },
  };

  public readonly queue: ConfigEnv["queue"] = {
    maxJobs: this.loadEnv("QUEUE_MAXJOBS", 10),
  };

  public readonly docs: ConfigEnv["docs"] = {
    swagger: {
      openapi: {
        info: { title: "PhantomPool", description: pkg.description, version: pkg.version }
      }
    },
    scalar: {
      routePrefix: "/docs",
      configuration: {
        theme: "saturn",
        layout: "classic",
        hiddenClients: true,
        hideSearch: true,
        hideDarkModeToggle: true,
        defaultOpenAllTags: true,
      }
    }
  }

  private loadEnv(key: string, def: string | number): any {
    const env: string | undefined = Bun.env?.[key];

    if (!env) return def;

    if (typeof def === "string") return env;

    if (typeof def !== "number") throw new ConfigInvalidEnvError(key);

    const envNum: number = Number(env);

    if (Number.isNaN(envNum)) throw new ConfigInvalidEnvError(key);

    return envNum;
  }
}
