import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ApiOperationOptions } from "@nestjs/swagger";

@Injectable()
export class OperationNameUtil {
  constructor(private readonly reflector: Reflector) {}

  get(context: ExecutionContext): string {
    const handler = context.getHandler();
    const controller = context.getClass();
    const apiOp = this.reflector.get<ApiOperationOptions>(
      "swagger/apiOperation",
      handler,
    );
    return apiOp?.operationId || `${controller.name}.${handler.name}`;
  }
}
