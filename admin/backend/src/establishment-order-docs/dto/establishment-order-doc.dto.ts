import { ApiProperty } from '@nestjs/swagger';

export class EstablishmentOrderDocDto {
  @ApiProperty({
    description: 'S3 object key for the document',
    example: 'REC0001/establishment-order.pdf',
  })
  s3_key: string;

  @ApiProperty({
    description: 'Recreation Resource ID',
    example: 'REC0001',
  })
  rec_resource_id: string;

  @ApiProperty({
    description: 'Title of the establishment order document',
    example: 'Establishment Order 2024',
  })
  title: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
    required: false,
  })
  file_size?: number;

  @ApiProperty({
    description: 'File extension',
    example: 'pdf',
    required: false,
  })
  extension?: string;

  @ApiProperty({
    description: 'Presigned URL for downloading the document',
    example: 'https://s3.amazonaws.com/...',
  })
  url: string;

  @ApiProperty({
    description: 'When the document was created',
    example: '2024-01-01T00:00:00Z',
    required: false,
  })
  created_at?: Date;
}
