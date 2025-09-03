import { LoggerService } from "@nestjs/common";
import { WinstonModule, utilities } from "nest-winston";
import { ClsServiceManager } from "nestjs-cls";
import * as winston from "winston";

const globalLoggerFormat: winston.Logform.Format = winston.format.timestamp({
  format: "YYYY-MM-DD hh:mm:ss.SSS",
});

const localLoggerFormat: winston.Logform.Format = winston.format.combine(
  winston.format.colorize(),
  winston.format.align(),
  utilities.format.nestLike("Backend", {
    prettyPrint: true,
    colors: true,
    processId: true,
  }),
);

export const customLogger: LoggerService = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      level: "silly",
      format: winston.format.combine(
        globalLoggerFormat,
        localLoggerFormat,
        winston.format.colorize({ level: true }),
        winston.format.printf(({ level, message, timestamp }) => {
          // Access CLS request ID
          const cls = ClsServiceManager.getClsService();
          const requestId = cls?.getId?.() || "no-reqid";

          return `[${timestamp}] [${level}] [req:${requestId}] ${message}`;
        }),
      ),
    }),
  ],
  exitOnError: false,
});
