import { ApiProperty } from "@nestjs/swagger";

export class RecreationActivityDto {
  @ApiProperty({
    description: "Unique code identifying the recreation activity",
    example: "HIKING",
  })
  recreation_activity_code: string;

  @ApiProperty({
    description: "Detailed description of the activity",
    example: "Hiking trails available for all skill levels",
  })
  description: string;
}

export class RecreationStatusDto {
  @ApiProperty({
    description: "Status code of the resource",
  })
  status_code: string;

  @ApiProperty({
    description: "Additional status information",
    example: "Temporary closure due to weather conditions",
    nullable: true,
  })
  comment: string;

  @ApiProperty({
    description: "Detailed status description",
    example: "The facility is currently closed to visitors",
  })
  description: string;
}

export class RecreationResourceDto {
  @ApiProperty({
    description: "Unique identifier of the Recreation Resource",
    example: "rec-123-abc",
    format: "uuid",
  })
  rec_resource_id: string;

  @ApiProperty({
    description: "Official name of the Recreation Resource",
    example: "Evergreen Valley Campground",
    minLength: 1,
    maxLength: 100,
  })
  name: string;

  @ApiProperty({
    description: "Detailed description of the Recreation Resource",
    example: "A scenic campground nestled in the heart of Evergreen Valley",
    nullable: true,
  })
  description: string;

  @ApiProperty({
    description: "Physical location of the Recreation Resource",
    example: "123 Forest Road, Mountain View, CA 94043",
  })
  site_location: string;

  @ApiProperty({
    description: "List of recreational activities available at this resource",
    type: [RecreationActivityDto],
  })
  recreation_activity: RecreationActivityDto[];

  @ApiProperty({
    description: "Current operational status of the Recreation Resource",
    type: RecreationStatusDto,
  })
  recreation_status: RecreationStatusDto;

  @ApiProperty({
    description:
      "Code representing a specific feature associated with the recreation resource",
    example: "IF",
  })
  rec_resource_type: string;
}
