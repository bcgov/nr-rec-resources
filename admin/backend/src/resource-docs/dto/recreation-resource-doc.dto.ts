import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
} from "class-validator";

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

// DTOs for Presigned Upload
export class PresignedUploadRequestDto {
  @ApiProperty({
    description: "Recreation resource ID",
    example: "REC204117",
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  recResourceId: string;

  @ApiProperty({
    description: "File name",
    example: "document.pdf",
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    description: "File size in bytes",
    example: 25000000,
    type: Number,
  })
  @IsNumber()
  fileSize: number;

  @ApiProperty({
    description: "Content type",
    example: "application/pdf",
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  contentType?: string;
}

export class PresignedUploadResponseDto {
  @ApiProperty({
    description: "Presigned upload URL",
    example: "https://bucket.s3.region.amazonaws.com/path?presigned=true",
    type: String,
  })
  uploadUrl: string;

  @ApiProperty({
    description: "Upload ID for tracking",
    example: "uuid-string",
    type: String,
  })
  uploadId: string;

  @ApiProperty({
    description: "Maximum file size allowed",
    example: 104857600,
    type: Number,
  })
  maxFileSize: number;

  @ApiProperty({
    description: "URL expiration time in seconds",
    example: 3600,
    type: Number,
  })
  expiresIn: number;

  @ApiProperty({
    description: "S3 key for the uploaded file",
    example: "uploads/REC204117/uuid/document.pdf",
    type: String,
  })
  key: string;
}

export class CompleteUploadRequestDto {
  @ApiProperty({
    description: "Upload ID from presigned URL response",
    example: "uuid-string",
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  uploadId: string;

  @ApiProperty({
    description: "Document title",
    example: "Campbell river site map",
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: "Original file name",
    example: "document.pdf",
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  originalFileName: string;

  @ApiProperty({
    description: "File size in bytes",
    example: 25000000,
    type: Number,
  })
  @IsNumber()
  fileSize: number;
}

export class CompleteUploadResponseDto {
  @ApiProperty({
    description: "Upload success status",
    example: true,
    type: Boolean,
  })
  success: boolean;

  @ApiProperty({
    description: "Document ID from DAM service",
    example: "dam-doc-id-123",
    type: String,
  })
  documentId: string;

  @ApiProperty({
    description: "File size in bytes",
    example: 25000000,
    type: Number,
  })
  fileSize: number;
}
