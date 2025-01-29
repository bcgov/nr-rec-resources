import { ApiProperty } from "@nestjs/swagger";

export class RecreationResourceDto {
  @ApiProperty({
    description: "The ID of the Recreation Resource",
  })
  rec_resource_id: string;

  @ApiProperty({
    description: "The name of the Recreation Resource",
  })
  name: string;

  @ApiProperty({
    description: "The description of the Recreation Resource",
  })
  description: string;

  @ApiProperty({
    description: "The location of the Recreation Resource",
  })
  site_location: string;

  @ApiProperty({
    description: "The list of available activities at the Recreation Resource",
  })
  recreation_activity: {
    recreation_activity_code: string;
    description: string;
  }[];

  @ApiProperty({
    description: "The status of the Recreation Resource",
  })
  recreation_status: {
    status_code: string;
    comment: string;
    description: string;
  };

  @ApiProperty({
    description: "The Recreation Map Feature",
  })
  recreation_map_feature: {
    description: string;
    recreation_map_feature_code: string;
  };
}
