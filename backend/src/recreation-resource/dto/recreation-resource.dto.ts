import { ApiProperty } from "@nestjs/swagger";
import { RecreationResourceImageDto } from "./recreation-resource-image.dto";

export class RecreationActivityDto {
  @ApiProperty({
    description: "Unique code identifying the recreation activity",
    example: "HIKING",
  })
  recreation_activity_code: number;

  @ApiProperty({
    description: "Detailed description of the activity",
    example: "Hiking trails available for all skill levels",
  })
  description: string;
}

export class RecreationFeeDto {
  @ApiProperty({
    description: "Amount charged for the recreation resource",
    example: 15,
  })
  fee_amount: number;

  @ApiProperty({
    description: "Description of the fee type",
    example: "Camping",
  })
  fee_description: string;

  @ApiProperty({
    description: "Start date for the fee applicability",
    example: "2024-06-01",
  })
  fee_start_date: Date;

  @ApiProperty({
    description: "End date for the fee applicability",
    example: "2024-09-30",
  })
  fee_end_date: Date;

  @ApiProperty({
    description: "Type of fee applicable",
    example: 1,
  })
  recreation_fee_code: number;

  @ApiProperty({
    description: "Indicates if the fee applies on Monday",
    example: "Y",
  })
  monday_ind: string;

  @ApiProperty({
    description: "Indicates if the fee applies on Tuesday",
    example: "Y",
  })
  tuesday_ind: string;

  @ApiProperty({
    description: "Indicates if the fee applies on Wednesday",
    example: "Y",
  })
  wednesday_ind: string;

  @ApiProperty({
    description: "Indicates if the fee applies on Thursday",
    example: "Y",
  })
  thursday_ind: string;

  @ApiProperty({
    description: "Indicates if the fee applies on Friday",
    example: "Y",
  })
  friday_ind: string;

  @ApiProperty({
    description: "Indicates if the fee applies on Saturday",
    example: "Y",
  })
  saturday_ind: string;

  @ApiProperty({
    description: "Indicates if the fee applies on Sunday",
    example: "Y",
  })
  sunday_ind: string;
}

export class RecreationStatusDto {
  @ApiProperty({
    description: "Status code of the resource",
  })
  status_code: number;

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

export class RecreationCampsiteDto {
  @ApiProperty({
    description:
      "Unique identifier of the Recreation Resource linked to campsites",
    example: "rec-123-abc",
    format: "uuid",
  })
  rec_resource_id: string;

  @ApiProperty({
    description:
      "Number of campsites available in the recreation site or trail",
    example: 15,
    minimum: 0,
  })
  campsite_count: number;
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
  closest_community: string;

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

  @ApiProperty({
    description: "List of images for the recreation resource",
    type: [RecreationResourceImageDto],
  })
  recreation_resource_images: RecreationResourceImageDto[];

  @ApiProperty({
    description:
      "Number of campsites available in the recreation site or trail",
    example: 15,
    minimum: 0,
  })
  recreation_campsite: RecreationCampsiteDto;

  @ApiProperty({
    description: "Fee details for the recreation resource",
    type: RecreationFeeDto,
  })
  recreation_fee: RecreationFeeDto;
}
