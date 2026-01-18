import type { RouteShorthandOptions } from "fastify";

export interface GetHtmlQuery {
  url: string;
}

export const getHtmlSchema: RouteShorthandOptions = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        url: {
          type: "string",
        },
        timeout: {
          type: "number",
          default: 3_000,
        },
      },
      required: ["url"],
    },
    response: {
      200: {
        type: "object",
        properties: {
          header: {
            status: {
              type: "number",
            },
            agent: {
              type: "string",
            },
          },
          html: {
            type: "string",
          },
        },
      },
    },
  },
};
