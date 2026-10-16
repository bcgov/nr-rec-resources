import { ApiProperty } from '@nestjs/swagger';

export class BcgwPaginationMetaDto {
  @ApiProperty({ description: 'Total features in the layer', example: 4213 })
  total: number;

  @ApiProperty({ description: 'Current page, 1-indexed', example: 1 })
  page: number;

  @ApiProperty({ example: 17 })
  totalPages: number;

  @ApiProperty({
    description:
      'Features per page. Varies by layer, since the geometry-heavy layers need ' +
      'smaller pages to keep a response within the gateway payload limit.',
    example: 250,
  })
  pageSize: number;
}

/**
 * The part of a GeoJSON Feature that does not vary by layer.
 *
 * `geometry` is declared on each subclass instead: its type and example differ
 * per layer (Point, LineString, Polygon), so there is nothing shared to inherit.
 */
export class BcgwFeatureBaseDto {
  @ApiProperty({ example: 'Feature' })
  type: 'Feature';
}

/**
 * The parts of a paginated FeatureCollection that do not vary by layer. Each
 * layer's concrete collection DTO adds only its typed `features` array.
 */
export class BcgwFeatureCollectionBaseDto {
  @ApiProperty({ example: 'FeatureCollection' })
  type: 'FeatureCollection';

  @ApiProperty({ type: () => BcgwPaginationMetaDto })
  meta: BcgwPaginationMetaDto;
}

/**
 * Structural result type for a page of any layer, parameterised by that layer's
 * properties DTO so the service stays layer-agnostic while the endpoints keep
 * their concrete, documented response types.
 */
export interface BcgwPaginatedResult<TProperties> {
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    geometry: object | null;
    properties: TProperties;
  }[];
  meta: BcgwPaginationMetaDto;
}
