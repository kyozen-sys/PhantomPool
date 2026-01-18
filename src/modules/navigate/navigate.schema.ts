import type { RouteShorthandOptions } from "fastify";

export interface getSchemaQuery {
  url: string;
  timeoutMS: number;
}

export interface getSchemaOkRes {
  header: {
    status: number;
    agent: string;
  };
  html: string;
}

export const getSchema: RouteShorthandOptions = {
  schema: {
    querystring: {
      type: "object",
      required: ["url"],
      properties: {
        url: { type: "string", format: "uri" },
        timeoutMS: { type: "number", default: 30_000 },
      },
    },
    response: {
      200: {
        type: "object",
        properties: {
          header: {
            type: "object",
            properties: {
              status: { type: "number" },
              agent: { type: "string" },
            },
          },
          html: { type: "string" },
        },
      },
    },
  },
};
