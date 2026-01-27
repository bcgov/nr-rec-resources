import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Enum representing available image size options for the recreation API
 */
export enum RecreationResourceDocCode {
  /** Recreation Map */
  RM = 'RM',
}

export class RecreationResourceDocDto {
  @ApiProperty({
    description: 'Document ID',
    type: String,
    example: '1000',
  })
  document_id?: string;

  @ApiProperty({
    description: 'File name',
    type: String,
    example: 'campbell-river-site-map.pdf',
  })
  file_name: string | null;

  @ApiProperty({
    description: 'rec_resource_id',
    type: String,
  })
  rec_resource_id: string | null;

  @ApiProperty({
    description: 'doc link',
    type: String,
  })
  url?: string;

  @ApiProperty({
    description: 'Document code that indicates the type of document',
    enum: RecreationResourceDocCode,
    example: RecreationResourceDocCode.RM,
    required: false,
  })
  doc_code: RecreationResourceDocCode | null;

  @ApiProperty({
    description: 'Description of the document code',
    type: String,
  })
  doc_code_description?: string;

  @ApiProperty({
    description: 'File extension',
    type: String,
  })
  extension: string | null;

  @ApiProperty({
    description: 'File upload date',
    type: String,
  })
  created_at: string | null;
}

/**
 * DTO for document presign endpoint response
 */
export class PresignDocUploadResponseDto {
  @ApiProperty({
    description: 'Allocated document ID (UUID)',
    example: 'a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9',
  })
  document_id: string;

  @ApiProperty({
    description: 'S3 object key for the document',
    example: 'documents/REC204118/a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9/map.pdf',
  })
  key: string;

  @ApiProperty({
    description: 'Presigned PUT URL for uploading to S3',
    example: 'https://bucket.s3.amazonaws.com/documents/REC204118/...',
  })
  url: string;
}

/**
 * DTO for document finalize endpoint request
 */
export class FinalizeDocUploadRequestDto {
  @ApiProperty({
    description: 'Document ID (returned from presign endpoint)',
    example: 'a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9',
  })
  @IsNotEmpty()
  @IsString()
  document_id: string;

  @ApiProperty({
    description: 'Document file name',
    example: 'campbell-river-site-map.pdf',
  })
  @IsNotEmpty()
  @IsString()
  file_name: string;

  @ApiProperty({
    description: 'File extension without dot',
    example: 'pdf',
  })
  @IsNotEmpty()
  @IsString()
  extension: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 2097152,
  })
  @IsNotEmpty()
  file_size: number;
}
