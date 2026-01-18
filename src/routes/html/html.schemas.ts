import type { RouteShorthandOptions } from "fastify";

export interface GetHtmlQuery {
  url: string;
  timeoutMS: number;
}

export const getHtmlSchema: RouteShorthandOptions = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        url: {
          type: "string",
        },
        timeoutMS: {
          type: "number",
          default: 30_000,
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
