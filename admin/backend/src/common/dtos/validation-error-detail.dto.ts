import { ApiProperty } from "@nestjs/swagger";

export class ValidationErrorDetailDto {
  @ApiProperty({
    description: "The name of the field that failed validation.",
    example: "name",
  })
  field: string;

  @ApiProperty({
    description: "An array of error messages for the field.",
    type: [String],
    example: [
      "name must be longer than or equal to 3 characters",
      "name should not be empty",
    ],
  })
  messages: string[];
}
