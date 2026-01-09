import { ApiProperty } from '@nestjs/swagger';

/**
 * Enum representing available image size options for the recreation API
 */
export enum RecreationResourceDocCode {
  /** Recreation Map */
  RM = 'RM',
}

export class RecreationResourceDocDto {
  @ApiProperty({
    description: 'Reference ID for the document',
    example: '1000',
  })
  doc_id: string;

  @ApiProperty({
    description: 'File name',
    example: 'Campbell river site map',
  })
  file_name: string;

  @ApiProperty({
    description: 'Download URL for the document',
  })
  url: string;

  @ApiProperty({
    description: 'Document code that indicates the type of document',
    enum: RecreationResourceDocCode,
  })
  doc_code: RecreationResourceDocCode;

  @ApiProperty({
    description: 'Description of the document code',
  })
  doc_code_description: string;

  @ApiProperty({
    description: 'File extension',
  })
  extension: string;
}
