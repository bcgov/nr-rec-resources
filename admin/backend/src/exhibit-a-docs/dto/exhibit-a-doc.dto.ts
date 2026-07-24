import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ExhibitADocDto {
  @ApiProperty({
    description: 'Document UUID',
    example: 'a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9',
  })
  document_id: string;

  @ApiProperty({ description: 'Recreation Resource ID', example: 'REC0001' })
  rec_resource_id: string;

  @ApiProperty({
    description: 'File name without extension',
    example: 'exhibit-a-2024',
  })
  file_name: string;

  @ApiProperty({ description: 'File extension', example: 'pdf' })
  extension: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
    required: false,
  })
  file_size?: number;

  @ApiProperty({
    description: 'S3 object key',
    example: 'REC0001/exhibit-a-2024.pdf',
  })
  s3_key: string;

  @ApiProperty({
    description: 'Presigned download URL',
    example: 'https://s3.amazonaws.com/...',
  })
  url: string;

  @ApiProperty({
    description: 'When the document was created',
    required: false,
  })
  created_at?: Date;
}

export class FinalizeExhibitAUploadRequestDto {
  @ApiProperty({
    description: 'Document ID returned from presign endpoint',
    example: 'a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9',
  })
  @IsNotEmpty()
  @IsString()
  document_id: string;

  @ApiProperty({
    description: 'File name without extension',
    example: 'exhibit-a-2024',
  })
  @IsNotEmpty()
  @IsString()
  file_name: string;

  @ApiProperty({ description: 'File extension without dot', example: 'pdf' })
  @IsNotEmpty()
  @IsString()
  extension: string;

  @ApiProperty({ description: 'File size in bytes', example: 2097152 })
  @IsNotEmpty()
  @IsNumber()
  file_size: number;
}

export class PresignExhibitAUploadResponseDto {
  @ApiProperty({
    description: 'Allocated document ID (UUID)',
    example: 'a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9',
  })
  document_id: string;

  @ApiProperty({
    description: 'S3 object key',
    example: 'REC0001/a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9/exhibit-a.pdf',
  })
  key: string;

  @ApiProperty({ description: 'Presigned PUT URL for uploading to S3' })
  url: string;
}
