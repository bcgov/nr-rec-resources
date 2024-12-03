import { ApiProperty } from "@nestjs/swagger";

export class RecreationResourceDto {
  @ApiProperty({
    description: "The ID of the Recreation Resource",
  })
  forest_file_id: string;

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
}
