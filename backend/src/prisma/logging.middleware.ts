import { Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";

interface LoggingMiddlewareOptions {
  logger: Console | Logger;
  logLevel: "log" | "debug" | "warn" | "error";
  logMessage?: (query: QueryInfo) => string;
}

interface QueryInfo {
  model: string;
  action: string;
  before: number;
  after: number;
  executionTime: number;
}

function loggingMiddleware(
  { logger, logMessage, logLevel }: LoggingMiddlewareOptions = {
    logger: console,
    logLevel: "debug",
  },
): Prisma.Middleware {
  return async (params, next) => {
    const before = Date.now();

    const result = await next(params);

    const after = Date.now();

    const executionTime = after - before;

    if (logMessage) {
      logger[logLevel](
        logMessage({
          model: params.model!,
          action: params.action,
          before,
          after,
          executionTime,
        }),
      );
    } else {
      logger[logLevel](
        `Prisma Query ${params.model}.${params.action} took ${executionTime}ms`,
      );
    }

    return result;
  };
}

export { loggingMiddleware };
