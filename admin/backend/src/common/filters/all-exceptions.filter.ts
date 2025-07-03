import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message:
        exception instanceof HttpException
          ? exception.getResponse()
          : exception instanceof Error
            ? exception.message
            : "Internal server error",
    };

    // For validation errors handled by the exceptionFactory in ValidationPipe,
    // the response will already be formatted. We can check for that.
    if (
      exception instanceof HttpException &&
      typeof exception.getResponse() === "object"
    ) {
      Object.assign(errorResponse, exception.getResponse());
    }

    response.status(status).json(errorResponse);
  }
}
