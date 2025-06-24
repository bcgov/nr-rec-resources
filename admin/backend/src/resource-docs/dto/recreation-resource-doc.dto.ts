import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

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
    example: "1000",
  })
  ref_id?: string;

  @ApiProperty({
    description: "Doc title",
    example: "Campbell river site map",
  })
  title: string | null;

  @ApiProperty({
    description: "rec_resource_id",
  })
  rec_resource_id: string | null;

  @ApiProperty({
    description: "doc link",
  })
  url?: string;

  @ApiProperty({
    description: "Document code that indicates the type of document",
    enum: RecreationResourceDocCode,
  })
  doc_code: RecreationResourceDocCode | null;

  @ApiProperty({
    description: "Description of the document code",
  })
  doc_code_description?: string;

  @ApiProperty({
    description: "File extension",
  })
  extension: string | null;
}

export class RecreationResourceDocBodyDto {
  @ApiProperty({
    description: "Doc title",
    example: "Campbell river site map",
  })
  @IsNotEmpty()
  title: string;
}

export class FileUploadDto {
  @ApiProperty({
    type: "string",
    format: "binary",
    description: "File to upload",
  })
  file: any;
}
