import { ApiProperty } from "@nestjs/swagger";

export class RecreationSuggestionDto {
  @ApiProperty({
    description: "Unique identifier for the recreation resource",
    example: "REC204117",
    type: String,
  })
  rec_resource_id: string;

  @ApiProperty({
    description: "Name of the recreation resource",
    example: "Blue Lake Campground",
    type: String,
  })
  name: string;

  @ApiProperty({
    description: "Closest known community to the resource",
    example: "Hope",
    type: String,
    required: false,
  })
  closest_community?: string;

  @ApiProperty({
    description: "Description of the recreation district",
    example: "Chilliwack District",
    type: String,
    required: false,
  })
  district_description?: string;

  @ApiProperty({
    description: "Type code of the recreation resource",
    example: "Recreation site",
    type: String,
    required: false,
  })
  recreation_resource_type?: string;

  @ApiProperty({
    description: "Type of the recreation resource",
    example: "SIT",
    type: String,
    required: false,
  })
  recreation_resource_type_code?: string;

  @ApiProperty({
    description: "Option type to differentiate in the suggestion list",
    example: "rec_resource",
    type: String,
    required: true,
  })
  option_type: "recreation_resource";
}
