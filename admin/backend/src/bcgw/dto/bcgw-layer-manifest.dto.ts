import { ApiProperty } from '@nestjs/swagger';

/**
 * Metadata written alongside each exported layer file. Lets consumers check
 * freshness without downloading the layer, and gives the export job something to
 * alarm on when runs stop happening.
 */
export class BcgwLayerManifestDto {
  @ApiProperty({ example: 'recreation-lines' })
  layer: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-09-23T17:00:04.512Z',
  })
  generated_at: string;

  @ApiProperty({ example: 4213 })
  feature_count: number;

  @ApiProperty({
    description: 'Size of the gzipped file in bytes',
    example: 20481234,
  })
  bytes: number;

  @ApiProperty({ type: String, required: false })
  etag?: string;
}
