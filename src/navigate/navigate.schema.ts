import { Type, type Static } from "@sinclair/typebox";

import { Value } from "@sinclair/typebox/value"

export const NavigateGetQuery = Type.Object({
  url: Type.String({ format: "uri" }),
  timeoutMS: Type.Optional(Type.Number({ default: 30_000 })),
});

export type NavigateGetQuery = Static<typeof NavigateGetQuery>;

export const NavigateGetOkResponse = Type.Object({
  header: Type.Object({
    status: Type.Number(),
    agent: Type.String(),
  }),
  html: Type.String(),
});

export type NavigateGetOkResponse = Static<typeof NavigateGetOkResponse>;

export const NavigateGetQueueFilledResponse = Type.Object({
  error: Type.String({ default: "Queue busy" }),
});

export const navigateGetQeueueFilledResponse = Value.Create(NavigateGetQueueFilledResponse);

export const NavigateGetAbortedResponse = Type.Object({
  error: Type.String({ default: "Request aborted" }),
});

export const navigateGetAbortedResponse = Value.Create(NavigateGetAbortedResponse);