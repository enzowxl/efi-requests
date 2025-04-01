import { AxiosError } from "axios";
import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: error.errors[0].message,
    });
  }

  if (error instanceof AxiosError) {
    reply.status(400).send({
      message: error.response?.data,
    });
  }
  if (error instanceof Error) {
    reply.status(400).send({
      message: error.message,
    });
  }

  reply.status(500).send({ message: "Internal server error" });
};
