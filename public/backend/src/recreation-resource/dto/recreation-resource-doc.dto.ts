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
    description: 'Reference ID for the image',
    example: '1000',
  })
  ref_id: string;

  @ApiProperty({
    description: 'Doc title',
    example: 'Campbell river site map',
  })
  title: string;

  @ApiProperty({
    description: 'doc link',
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
