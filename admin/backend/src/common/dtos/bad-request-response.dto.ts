import { ApiProperty } from "@nestjs/swagger";
import { GenericErrorResponseDto } from "./generic-error-response.dto"; // Import the generic DTO
import { ValidationErrorDetailDto } from "./validation-error-detail.dto";

export class BadRequestResponseDto extends GenericErrorResponseDto {
  @ApiProperty({
    description:
      "An array of detailed validation errors specific to this bad request.",
    type: [ValidationErrorDetailDto], // Reference the nested DTO
    example: [
      {
        field: "email",
        messages: ["email must be an email"],
      },
      {
        field: "password",
        messages: [
          "password should not be empty",
          "password must be longer than or equal to 6 characters",
        ],
      },
    ],
  })
  details: ValidationErrorDetailDto[];

  @ApiProperty({
    type: "integer",
    enum: [400],
  })
  readonly statusCode = 400;
}
