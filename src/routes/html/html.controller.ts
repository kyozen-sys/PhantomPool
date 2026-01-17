import type { FastifyReply, FastifyRequest } from "fastify";

export function getHtmlController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = request.body;

  console.log(body);

  return reply.send("Hello, World!");
}
