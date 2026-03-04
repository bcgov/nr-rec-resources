import { ApiProperty } from '@nestjs/swagger';

export class ExportPreviewResponseDto {
  @ApiProperty({
    type: [String],
    description: 'Column names returned by the preview query',
  })
  columns: string[];

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: {
        type: 'string',
        nullable: true,
      },
    },
    description: 'Preview rows keyed by column name',
    example: [
      {
        rec_resource_id: 'REC0001',
        resource_name: 'Sample recreation resource',
      },
    ],
  })
  rows: Array<Record<string, string | null>>;
}
