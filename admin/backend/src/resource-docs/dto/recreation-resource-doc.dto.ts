import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Length, Matches } from "class-validator";

/**
 * Enum representing available image size options for the recreation API
 */
export enum RecreationResourceDocCode {
  /** Recreation Map */
  RM = "RM",
}

export class RecreationResourceDocDto {
  @ApiProperty({
    description: "Reference ID for the image",
    type: String,
    example: "1000",
  })
  ref_id?: string;

  @ApiProperty({
    description: "Doc title",
    type: String,
    example: "Campbell river site map",
  })
  title: string | null;

  @ApiProperty({
    description: "rec_resource_id",
    type: String,
  })
  rec_resource_id: string | null;

  @ApiProperty({
    description: "doc link",
    type: String,
  })
  url?: string;

  @ApiProperty({
    description: "Document code that indicates the type of document",
    enum: RecreationResourceDocCode,
  })
  doc_code: RecreationResourceDocCode | null;

  @ApiProperty({
    description: "Description of the document code",
    type: String,
  })
  doc_code_description?: string;

  @ApiProperty({
    description: "File extension",
    type: String,
  })
  extension: string | null;

  @ApiProperty({
    description: "File upload date",
    type: String,
  })
  created_at: string | null;
}

export class CreateRecreationResourceDocBodyDto {
  @ApiProperty({
    description: "Doc title",
    example: "Campbell river site map",
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  @Matches(/^[A-Za-z0-9-_'(). ]+$/, {
    message:
      "document title can only contain alphanumeric characters and spaces",
  })
  @Length(3, 100)
  @IsNotEmpty()
  title: string;
}

export class CreateRecreationResourceDocFormDto {
  @ApiProperty({
    description: "Document title",
    example: "Campbell river site map",
    minLength: 3,
    maxLength: 100,
    pattern: "^[A-Za-z0-9-_'(). ]+$",
    type: String,
  })
  title: string;

  @ApiProperty({
    type: "string",
    format: "binary",
    description: "File to upload",
  })
  file: any;
}
