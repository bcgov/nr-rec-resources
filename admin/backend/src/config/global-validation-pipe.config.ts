import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { ValidationError } from "class-validator";

export const globalValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  exceptionFactory: (errors: ValidationError[]) => {
    const formattedErrors = errors.map((error) => ({
      field: error.property,
      messages: Object.values(error.constraints || {}),
    }));
    return new BadRequestException({
      statusCode: 400,
      error: "Bad Request",
      message: "Validation failed",
      details: formattedErrors,
    });
  },
});
