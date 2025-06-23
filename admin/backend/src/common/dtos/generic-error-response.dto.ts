import { ApiProperty } from "@nestjs/swagger";
import { HttpStatus } from "@nestjs/common";

export const ErrorHttpStatusCodes = [
  HttpStatus.BAD_REQUEST,
  HttpStatus.UNAUTHORIZED,
  HttpStatus.FORBIDDEN,
  HttpStatus.NOT_FOUND,
  HttpStatus.INTERNAL_SERVER_ERROR,
] as const;

export class GenericErrorResponseDto {
  @ApiProperty({
    description: "The HTTP status code of the error response.",
    example: 404,
    enum: ErrorHttpStatusCodes,
  })
  statusCode: number;

  @ApiProperty({
    description: "A general message describing the error.",
    example: "Resource Not Found",
  })
  message: string; // Keep this as string if your generic filter always produces a string message here

  @ApiProperty({
    description: "The error type or short description of the HTTP status.",
    example: "Not Found",
  })
  error?: string; // Optional, can be derived from status code

  @ApiProperty({
    description: "The timestamp of when the error occurred (ISO 8601 format).",
    example: "2025-06-13T21:13:23.000Z", // Example based on current time
  })
  timestamp: string;

  @ApiProperty({
    description: "The request path that caused the error.",
    example: "/api/v1/users/invalid-input",
  })
  path: string;
}
