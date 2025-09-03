import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ApiOperationOptions } from "@nestjs/swagger";
import { SWAGGER_CONSTANTS } from "./api-metrics.constants";

@Injectable()
export class OperationNameUtil {
  constructor(private readonly reflector: Reflector) {}

  get(context: ExecutionContext): string {
    const handler = context.getHandler();
    const controller = context.getClass();
    const apiOp = this.reflector.get<ApiOperationOptions>(
      SWAGGER_CONSTANTS.API_OPERATION,
      handler,
    );
    return apiOp?.operationId || `${controller.name}.${handler.name}`;
  }
}
