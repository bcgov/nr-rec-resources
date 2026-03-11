import { ApiProperty } from '@nestjs/swagger';

export class RecreationResourceSummaryDto {
  @ApiProperty({
    description: 'Unique identifier of the Recreation Resource',
    example: 'REC204117',
  })
  rec_resource_id: string;

  @ApiProperty({
    description: 'Official name of the Recreation Resource',
    example: 'Aileen Lake',
  })
  name: string;

  @ApiProperty({
    description: 'District code of the Recreation Resource',
    example: 'RDCK',
  })
  district_code: string;

  @ApiProperty({
    description: 'District description',
    example: 'Chilliwack',
  })
  district: string;

  @ApiProperty({
    description: 'Recreation resource type code',
    example: 'SIT',
  })
  rec_resource_type_code: string;

  @ApiProperty({
    description: 'Recreation resource type description',
    example: 'Recreation Site',
  })
  rec_resource_type: string;

  @ApiProperty({
    description: 'Whether the resource is displayed on the public site',
    example: true,
  })
  display_on_public_site: boolean;

  @ApiProperty({
    description: 'Status code of the resource (e.g. 1=Open, 2=Closed)',
    example: 2,
    nullable: true,
  })
  status_code: number | null;

  @ApiProperty({
    description: 'Status description',
    example: 'Closed',
    nullable: true,
  })
  status: string | null;

  @ApiProperty({
    description: 'Closure or status comment',
    example: 'Closed due to wildfire activity in the area',
    nullable: true,
  })
  closure_comment: string | null;

  @ApiProperty({
    description:
      'GeoJSON geometry data for the point location of the recreation resource',
    example: '{"type":"Point","coordinates":[1292239.7691,1133870.4011]}',
    nullable: true,
  })
  site_point_geometry: string | null;
}
