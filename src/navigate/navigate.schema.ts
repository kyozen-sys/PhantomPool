import { Type, type Static } from "@sinclair/typebox";

export const NavigateGetQuery = Type.Object({
  url: Type.String({ format: "uri" }),
  timeoutMS: Type.Optional(Type.Number({ default: 30_000 })),
});

export const NavigateGetOkResponse = Type.Object({
  header: Type.Object({
    status: Type.Number(),
    agent: Type.String(),
  }),
  html: Type.String(),
});

export type NavigateGetQuery = Static<typeof NavigateGetQuery>;

export type NavigateGetOkResponse = Static<typeof NavigateGetOkResponse>;