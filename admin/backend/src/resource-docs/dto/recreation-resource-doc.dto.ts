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

export class CreateRecreationResourceDocBodyDto {
  @ApiProperty({
    description: 'File name',
    example: 'document-name.pdf',
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  file_name: string;
}

export class CreateRecreationResourceDocFormDto {
  @ApiProperty({
    description: 'File name',
    example: 'document-name.pdf',
    type: String,
  })
  file_name: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
  })
  file: any;
}
