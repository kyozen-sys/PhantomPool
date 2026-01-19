export interface ConfigEnv {
  server: {
    host: string;
    port: number;
  };
  browser: {
    pool: {
      retryMS: number;
      size: number;
      leaseTimeoutMS: number;
    };
  };
  queue: {
    maxJobs: number;
    retryMS: number;
  };
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
      retryMS: this.loadEnv("BROWSER_POOL_RETRYMS", 3_000),
      size: this.loadEnv("BROWSER_POOL_SIZE", 2),
      leaseTimeoutMS: this.loadEnv("BROWSER_LEASE_TIMEOUTMS", 60_000),
    },
  };

  public readonly queue: ConfigEnv["queue"] = {
    maxJobs: this.loadEnv("QUEUE_MAXJOBS", 10),
    retryMS: this.loadEnv("QUEUE_RETRYMS", 100),
  };

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
